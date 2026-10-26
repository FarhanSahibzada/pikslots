import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bullmq';
import {
  EditServiceCommand,
  err,
  IServiceRepository,
  InfrastructureError,
  Service,
  ServiceNotFoundError,
  UnauthorizedError,
} from '@pikslots/domain';
import { SERVICE_TEST_DATA } from '../repository/service.test.data';
import { EditServiceUseCaseImpl } from './edit.service.usecase.impl';
import { ServiceRepositoryTestImpl } from '../repository/service.repository.fake.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';
import {
  AUDIT_LOG_QUEUE,
  PIKSLOT_EVENTS,
} from 'src/shared/queue/jobs/pikslot.events';
import { IPikslotS3Service } from 'src/shared/s3/s3.service';

function buildCommand(
  overrides: Partial<EditServiceCommand> = {},
): EditServiceCommand {
  return {
    id: 'service-haircut-1',
    title: 'Haircut & Style - Updated',
    description: 'Updated description.',
    imagesUrls: ['https://cdn.example.com/services/haircut-1-updated.jpg'],
    durationInMins: 50,
    bufferTimeInMins: 20,
    cost: 45,
    isHiddenFromBookingPage: false,
    colorCode: '#000000',
    businessId: 'business-1',
    updatedBy: 'user-business-owner-1',
    associatedServiceGroups: ['service-group-1', 'service-group-2'],
    associatedUsers: ['user-standard-1', 'user-enhanced-1'],
    ...overrides,
  } as EditServiceCommand;
}

describe('EditServiceUseCaseImpl', () => {
  let useCase: EditServiceUseCaseImpl;
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
        EditServiceUseCaseImpl,
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
          provide: IPikslotS3Service,
          useValue: {
            extractKeyFromUrl: jest.fn().mockResolvedValue('sample-image'),
          },
        },
        {
          provide: getQueueToken(AUDIT_LOG_QUEUE),
          useValue: { add: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    useCase = moduleRef.get(EditServiceUseCaseImpl);
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
    // Captured once here so assertions reference plain variables instead of
    // bare `queue.add` property access, which trips
    // @typescript-eslint/unbound-method on jest mocks.
    groupAddSpy = jest.spyOn(groupQueue, 'add');
    userAddSpy = jest.spyOn(userQueue, 'add');
  });

  describe('authorization is checked before the service is looked up', () => {
    it('returns unauthorized (not service_not_found) for an unauthorized caller targeting a non-existent service', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced', // never allowed to edit, regardless of business
        businessId: 'business-1',
      });
      const findByIdSpy = jest.spyOn(repository, 'findById');

      const result = await useCase.execute(
        buildCommand({
          id: 'non-existent-service',
          businessId: 'business-1',
        }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(findByIdSpy).not.toHaveBeenCalled();
      expect(groupAddSpy).not.toHaveBeenCalled();
      expect(userAddSpy).not.toHaveBeenCalled();
    });
  });

  describe('not found', () => {
    it('returns service_not_found when the service does not exist, for an authorized caller', async () => {
      const result = await useCase.execute(
        buildCommand({
          id: 'non-existent-service',
          businessId: 'business-1',
        }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as ServiceNotFoundError).kind).toBe(
          'service_not_found',
        );
      }
      expect(groupAddSpy).not.toHaveBeenCalled();
      expect(userAddSpy).not.toHaveBeenCalled();
    });
  });

  describe('authorization', () => {
    it('allows a Platform Owner to edit any service', async () => {
      Object.assign(securityContext, {
        userId: 'user-platform-owner-1',
        role: 'Platform Owner',
        businessId: 'business-999', // different business, shouldn't matter
      });

      const result = await useCase.execute(
        buildCommand({
          id: 'service-business-2-1',
          businessId: 'business-2',
        }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows a Business Owner to edit a service within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ id: 'service-haircut-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows an Admin to edit a service within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ id: 'service-massage-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('denies a Business Owner acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });
      const findByIdSpy = jest.spyOn(repository, 'findById');

      const result = await useCase.execute(
        buildCommand({
          id: 'service-business-2-1',
          businessId: 'business-2',
        }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(findByIdSpy).not.toHaveBeenCalled();
    });

    it('denies an Admin acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-1',
      });
      const findByIdSpy = jest.spyOn(repository, 'findById');

      const result = await useCase.execute(
        buildCommand({
          id: 'service-business-2-1',
          businessId: 'business-2',
        }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(findByIdSpy).not.toHaveBeenCalled();
    });

    it('denies an Enhanced user even within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });
      const findByIdSpy = jest.spyOn(repository, 'findById');

      const result = await useCase.execute(
        buildCommand({ id: 'service-haircut-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(findByIdSpy).not.toHaveBeenCalled();
    });

    it('denies a Standard user even within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });
      const findByIdSpy = jest.spyOn(repository, 'findById');

      const result = await useCase.execute(
        buildCommand({ id: 'service-haircut-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(findByIdSpy).not.toHaveBeenCalled();
    });
  });

  describe('repository failures', () => {
    it('propagates an InfrastructureError from findById', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'DB unreachable',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest.spyOn(repository, 'findById').mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
      expect(groupAddSpy).not.toHaveBeenCalled();
      expect(userAddSpy).not.toHaveBeenCalled();
    });

    it('propagates an InfrastructureError from update, without enqueueing either sync job', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to update service',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest.spyOn(repository, 'update').mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
      expect(groupAddSpy).not.toHaveBeenCalled();
      expect(userAddSpy).not.toHaveBeenCalled();
    });

    it('propagates a ServiceNotFoundError raised by update itself', async () => {
      const notFoundError: ServiceNotFoundError = {
        kind: 'service_not_found',
        by: 'id',
        value: 'service-haircut-1',
        message: 'Service not found',
        timestamp: new Date(),
      };
      jest
        .spyOn(repository, 'update')
        .mockResolvedValueOnce(err(notFoundError));

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as ServiceNotFoundError).kind).toBe(
          'service_not_found',
        );
      }
      expect(groupAddSpy).not.toHaveBeenCalled();
      expect(userAddSpy).not.toHaveBeenCalled();
    });
  });

  describe('successful edit', () => {
    it('updates the service and returns ok(undefined)', async () => {
      const updateSpy = jest.spyOn(repository, 'update');

      const command = buildCommand({
        id: 'service-haircut-1',
        title: 'Haircut & Style - Updated',
        cost: 45,
        durationInMins: 50,
      });

      const result = await useCase.execute(command);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeUndefined();
      }
      expect(updateSpy).toHaveBeenCalledTimes(1);

      const [savedArg] = updateSpy.mock.calls[0];
      expect(savedArg.id).toBe('service-haircut-1');
      expect(savedArg.title).toBe(command.title);
      expect(savedArg.cost).toBe(command.cost);
      expect(savedArg.durationInMins).toBe(command.durationInMins);
      expect(savedArg.updatedBy).toBe(command.updatedBy);

      // businessId and createdBy must be preserved, not overwritten
      expect(savedArg.businessId).toBe('business-1');

      const persisted = SERVICE_TEST_DATA.find(
        (s) => s.id === 'service-haircut-1',
      );
      expect(persisted?.title).toBe(command.title);
    });

    it('enqueues a service-group sync job with the correct payload', async () => {
      const command = buildCommand({
        id: 'service-haircut-1',
        businessId: 'business-1',
        updatedBy: 'user-business-owner-1',
        associatedServiceGroups: ['service-group-1', 'service-group-2'],
      });

      await useCase.execute(command);

      expect(groupAddSpy).toHaveBeenCalledTimes(1);
      expect(groupAddSpy).toHaveBeenCalledWith(
        PIKSLOT_EVENTS.SERVICE_GROUP_ASSIGNMENT.SYNC_SERVICE_SERVICE_GROUPS,
        {
          serviceId: command.id,
          serviceGroupIds: command.associatedServiceGroups,
          businessId: command.businessId,
          assignedBy: command.updatedBy,
        },
      );
    });

    it('enqueues a service-user sync job with the correct payload', async () => {
      const command = buildCommand({
        id: 'service-haircut-1',
        businessId: 'business-1',
        updatedBy: 'user-business-owner-1',
        associatedUsers: ['user-standard-1', 'user-enhanced-1'],
      });

      await useCase.execute(command);

      expect(userAddSpy).toHaveBeenCalledTimes(1);
      expect(userAddSpy).toHaveBeenCalledWith(
        PIKSLOT_EVENTS.SERVICE_USER_ASSIGNMENT.SYNC_SERVICE_TO_USERS,
        {
          serviceId: command.id,
          userIds: command.associatedUsers,
          businessId: command.businessId,
          assignedBy: command.updatedBy,
        },
      );
    });

    it('still enqueues the service-group sync job when associatedServiceGroups is empty, so removals are processed', async () => {
      const command = buildCommand({
        id: 'service-haircut-1',
        associatedServiceGroups: [],
        associatedUsers: ['user-standard-1'],
      });

      await useCase.execute(command);

      expect(groupAddSpy).toHaveBeenCalledTimes(1);
      expect(groupAddSpy).toHaveBeenCalledWith(
        PIKSLOT_EVENTS.SERVICE_GROUP_ASSIGNMENT.SYNC_SERVICE_SERVICE_GROUPS,
        expect.objectContaining({ serviceGroupIds: [] }),
      );
      expect(userAddSpy).toHaveBeenCalledTimes(1);
      expect(userAddSpy).toHaveBeenCalledWith(
        PIKSLOT_EVENTS.SERVICE_USER_ASSIGNMENT.SYNC_SERVICE_TO_USERS,
        expect.objectContaining({ userIds: ['user-standard-1'] }),
      );
    });
  });

  describe('team member requirement', () => {
    it('rejects an edit that would remove the last assigned team member', async () => {
      const updateSpy = jest.spyOn(repository, 'update');

      const command = buildCommand({
        id: 'service-haircut-1',
        associatedServiceGroups: ['service-group-1'],
        associatedUsers: [],
      });

      const result = await useCase.execute(command);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('validation');
        expect(result.error.message).toMatch(/team member/i);
      }
      expect(updateSpy).not.toHaveBeenCalled();
      expect(groupAddSpy).not.toHaveBeenCalled();
      expect(userAddSpy).not.toHaveBeenCalled();

      const persisted = SERVICE_TEST_DATA.find(
        (s) => s.id === 'service-haircut-1',
      );
      expect(persisted?.title).toBe('Haircut & Style');
    });

    it('returns service_not_found before the team member check for an unknown id', async () => {
      const result = await useCase.execute(
        buildCommand({ id: 'unknown-service', associatedUsers: [] }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('service_not_found');
      }
    });
  });
});
