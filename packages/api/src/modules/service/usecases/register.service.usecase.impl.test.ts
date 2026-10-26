import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bullmq';
import {
  err,
  IServiceRepository,
  InfrastructureError,
  RegisterServiceCommand,
  Service,
  UnauthorizedError,
} from '@pikslots/domain';
import { SERVICE_TEST_DATA } from '../repository/service.test.data';
import { RegisterServiceUseCaseImpl } from './register.service.usecase.impl';
import { ServiceRepositoryTestImpl } from '../repository/service.repository.fake.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';
import {
  AUDIT_LOG_QUEUE,
  PIKSLOT_EVENTS,
} from 'src/shared/queue/jobs/pikslot.events';

jest.mock('uuid', () => ({
  v7: () => 'mock-generated-id',
}));

function buildCommand(
  overrides: Partial<RegisterServiceCommand> = {},
): RegisterServiceCommand {
  return {
    title: 'New Facial Treatment',
    description: 'A brand-new facial service.',
    imagesUrls: ['https://cdn.example.com/services/new-facial.jpg'],
    durationInMins: 40,
    bufferTimeInMins: 15,
    cost: 55,
    isHiddenFromBookingPage: false,
    colorCode: '#B5838D',
    businessId: 'business-1',
    createdBy: 'user-business-owner-1',
    associatedServiceGroups: [],
    associatedUsers: ['user-standard-1'],
    ...overrides,
  } as RegisterServiceCommand;
}

describe('RegisterServiceUseCaseImpl', () => {
  let useCase: RegisterServiceUseCaseImpl;
  let repository: ServiceRepositoryTestImpl;
  let groupQueue: jest.Mocked<Queue>;
  let userQueue: jest.Mocked<Queue>;
  let groupAddSpy: jest.SpyInstance;
  let userAddSpy: jest.SpyInstance;
  let securityContext: SecurityContext;
  let originalData: Service[];

  beforeEach(async () => {
    if (!originalData) originalData = [...SERVICE_TEST_DATA];
    SERVICE_TEST_DATA.length = 0;
    SERVICE_TEST_DATA.push(...originalData);

    securityContext = {
      userId: 'user-business-owner-1',
      role: 'Business Owner',
      businessId: 'business-1',
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterServiceUseCaseImpl,
        { provide: IServiceRepository, useClass: ServiceRepositoryTestImpl },
        { provide: SecurityContext, useValue: securityContext },
        {
          provide: getQueueToken(
            PIKSLOT_EVENTS.SERVICE_GROUP_ASSIGNMENT.SYNC_SERVICE_SERVICE_GROUPS,
          ),
          useValue: { add: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: getQueueToken(
            PIKSLOT_EVENTS.SERVICE_USER_ASSIGNMENT.SYNC_SERVICE_TO_USERS,
          ),
          useValue: { add: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: getQueueToken(AUDIT_LOG_QUEUE),
          useValue: { add: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    useCase = moduleRef.get(RegisterServiceUseCaseImpl);
    repository = moduleRef.get(IServiceRepository);
    groupQueue = moduleRef.get(
      getQueueToken(
        PIKSLOT_EVENTS.SERVICE_GROUP_ASSIGNMENT.SYNC_SERVICE_SERVICE_GROUPS,
      ),
    );
    userQueue = moduleRef.get(
      getQueueToken(
        PIKSLOT_EVENTS.SERVICE_USER_ASSIGNMENT.SYNC_SERVICE_TO_USERS,
      ),
    );
    groupAddSpy = jest.spyOn(groupQueue, 'add');
    userAddSpy = jest.spyOn(userQueue, 'add');
  });

  describe('authorization', () => {
    it('allows a Platform Owner to register a service for any business', async () => {
      Object.assign(securityContext, {
        userId: 'user-platform-owner-1',
        role: 'Platform Owner',
        businessId: 'business-999', // different business, shouldn't matter
      });

      const result = await useCase.execute(
        buildCommand({ businessId: 'business-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows a Business Owner to register a service within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ businessId: 'business-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows an Admin to register a service within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ businessId: 'business-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('denies a Business Owner acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });
      const saveSpy = jest.spyOn(repository, 'save');

      const result = await useCase.execute(
        buildCommand({ businessId: 'business-2' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(saveSpy).not.toHaveBeenCalled();
      expect(groupAddSpy).not.toHaveBeenCalled();
      expect(userAddSpy).not.toHaveBeenCalled();
    });

    it('denies an Admin acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-1',
      });
      const saveSpy = jest.spyOn(repository, 'save');

      const result = await useCase.execute(
        buildCommand({ businessId: 'business-2' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(saveSpy).not.toHaveBeenCalled();
    });

    // canRegisterService has no allowance for Enhanced/Standard at all --
    // there's no "same business" path for these roles.
    it('denies an Enhanced user even within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });
      const saveSpy = jest.spyOn(repository, 'save');

      const result = await useCase.execute(
        buildCommand({ businessId: 'business-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('denies a Standard user even within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });
      const saveSpy = jest.spyOn(repository, 'save');

      const result = await useCase.execute(
        buildCommand({ businessId: 'business-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  describe('repository failures', () => {
    it('propagates an InfrastructureError from save, without enqueueing either sync job', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to save service',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest.spyOn(repository, 'save').mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute(
        buildCommand({
          associatedServiceGroups: ['service-group-1'],
          associatedUsers: ['user-standard-1'],
        }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
      expect(groupAddSpy).not.toHaveBeenCalled();
      expect(userAddSpy).not.toHaveBeenCalled();
    });

    // NOTE: same gap as RegisterClassUseCaseImpl -- ServiceProps documents
    // "title should be unique per business," and
    // ServiceRepositoryImpl.existsByTitle exists to check that, but this
    // use case never calls it. A duplicate title is only ever caught (if
    // at all) by the database's own unique constraint, surfacing as a
    // generic InfrastructureError rather than a domain conflict error.
    it('a duplicate title is not checked before saving (no existsByTitle call)', async () => {
      const existsByTitleSpy = jest.spyOn(repository, 'existsByTitle');

      // service-haircut-1 already has the title "Haircut & Style" in business-1
      const result = await useCase.execute(
        buildCommand({
          title: 'Haircut & Style',
          businessId: 'business-1',
        }),
      );

      expect(existsByTitleSpy).not.toHaveBeenCalled();
      expect(result.ok).toBe(true);
    });
  });

  describe('successful registration', () => {
    it('builds and saves a Service entity matching the command', async () => {
      const command = buildCommand({
        title: 'New Facial Treatment',
        businessId: 'business-1',
        createdBy: 'user-business-owner-1',
      });

      const result = await useCase.execute(command);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe('mock-generated-id');
        expect(result.value.title).toBe(command.title);
        expect(result.value.description).toBe(command.description);
        expect(result.value.durationInMins).toBe(command.durationInMins);
        expect(result.value.bufferTimeInMins).toBe(command.bufferTimeInMins);
        expect(result.value.cost).toBe(command.cost);
        expect(result.value.colorCode).toBe(command.colorCode);
        expect(result.value.businessId).toBe(command.businessId);
        expect(result.value.createdBy).toBe(command.createdBy);
        expect(result.value.isDeleted).toBe(false);
      }

      const persisted = SERVICE_TEST_DATA.find(
        (s) => s.id === 'mock-generated-id',
      );
      expect(persisted).toBeDefined();
    });

    it('rejects registration when no team member is assigned', async () => {
      const saveSpy = jest.spyOn(repository, 'save');

      const result = await useCase.execute(
        buildCommand({ associatedServiceGroups: [], associatedUsers: [] }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('validation');
        expect(result.error.message).toMatch(/team member/i);
      }
      expect(saveSpy).not.toHaveBeenCalled();
      expect(groupAddSpy).not.toHaveBeenCalled();
      expect(userAddSpy).not.toHaveBeenCalled();
    });

    it('rejects registration with an empty associatedUsers list even when service groups are provided', async () => {
      const saveSpy = jest.spyOn(repository, 'save');

      const command = buildCommand({
        businessId: 'business-1',
        createdBy: 'user-business-owner-1',
        associatedServiceGroups: ['service-group-1'],
        associatedUsers: [],
      });

      const result = await useCase.execute(command);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('validation');
      }
      expect(saveSpy).not.toHaveBeenCalled();
      expect(groupAddSpy).not.toHaveBeenCalled();
      expect(userAddSpy).not.toHaveBeenCalled();
    });

    it('enqueues only the service-user sync job when only users are provided', async () => {
      const command = buildCommand({
        businessId: 'business-1',
        createdBy: 'user-business-owner-1',
        associatedServiceGroups: [],
        associatedUsers: ['user-standard-1'],
      });

      await useCase.execute(command);

      expect(userAddSpy).toHaveBeenCalledTimes(1);
      expect(userAddSpy).toHaveBeenCalledWith(
        PIKSLOT_EVENTS.SERVICE_USER_ASSIGNMENT.SYNC_SERVICE_TO_USERS,
        {
          serviceId: 'mock-generated-id',
          userIds: command.associatedUsers,
          businessId: command.businessId,
          assignedBy: command.createdBy,
        },
      );
      expect(groupAddSpy).not.toHaveBeenCalled();
    });

    it('enqueues both sync jobs when both association lists are non-empty', async () => {
      const command = buildCommand({
        businessId: 'business-1',
        createdBy: 'user-business-owner-1',
        associatedServiceGroups: ['service-group-1', 'service-group-2'],
        associatedUsers: ['user-standard-1', 'user-enhanced-1'],
      });

      await useCase.execute(command);

      expect(groupAddSpy).toHaveBeenCalledTimes(1);
      expect(groupAddSpy).toHaveBeenCalledWith(
        PIKSLOT_EVENTS.SERVICE_GROUP_ASSIGNMENT.SYNC_SERVICE_SERVICE_GROUPS,
        {
          serviceId: 'mock-generated-id',
          serviceGroupIds: command.associatedServiceGroups,
          businessId: command.businessId,
          assignedBy: command.createdBy,
        },
      );
      expect(userAddSpy).toHaveBeenCalledTimes(1);
      expect(userAddSpy).toHaveBeenCalledWith(
        PIKSLOT_EVENTS.SERVICE_USER_ASSIGNMENT.SYNC_SERVICE_TO_USERS,
        {
          serviceId: 'mock-generated-id',
          userIds: command.associatedUsers,
          businessId: command.businessId,
          assignedBy: command.createdBy,
        },
      );
    });
  });
});
