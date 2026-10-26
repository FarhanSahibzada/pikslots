import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bullmq';
import {
  Class,
  err,
  IClassRepository,
  InfrastructureError,
  RegisterClassCommand,
  UnauthorizedError,
} from '@pikslots/domain';
import { CLASS_TEST_DATA } from '../repository/class.test.data';
import { RegisterClassUseCaseImpl } from './register.class.usecase.impl';
import { ClassRepositoryTestImpl } from '../repository/class.repository.fake.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';
import {
  AUDIT_LOG_QUEUE,
  PIKSLOT_EVENTS,
} from 'src/shared/queue/jobs/pikslot.events';

jest.mock('uuid', () => ({
  v7: () => 'mock-generated-id',
}));

function buildCommand(
  overrides: Partial<RegisterClassCommand> = {},
): RegisterClassCommand {
  return {
    title: 'New Spin Class',
    description: 'A brand-new cycling class.',
    imagesUrls: ['https://cdn.example.com/classes/new-spin.jpg'],
    durationInMins: 45,
    seats: 20,
    cost: 22,
    isHiddenFromBookingPage: false,
    businessId: 'business-1',
    createdBy: 'user-business-owner-1',
    associatedClassGroupIds: [],
    ...overrides,
  };
}

describe('RegisterClassUseCaseImpl', () => {
  let useCase: RegisterClassUseCaseImpl;
  let repository: ClassRepositoryTestImpl;
  let queue: jest.Mocked<Queue>;
  let addSpy: jest.SpyInstance;
  let securityContext: SecurityContext;
  let originalData: Class[];

  beforeEach(async () => {
    if (!originalData) originalData = [...CLASS_TEST_DATA];
    CLASS_TEST_DATA.length = 0;
    CLASS_TEST_DATA.push(...originalData);

    securityContext = {
      userId: 'user-business-owner-1',
      role: 'Business Owner',
      businessId: 'business-1',
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterClassUseCaseImpl,
        { provide: IClassRepository, useClass: ClassRepositoryTestImpl },
        { provide: SecurityContext, useValue: securityContext },
        {
          provide: getQueueToken(
            PIKSLOT_EVENTS.CLASS_GROUP_ASSIGNMENT.SYNC_CLASS_CLASS_GROUPS,
          ),
          useValue: { add: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: getQueueToken(AUDIT_LOG_QUEUE),
          useValue: { add: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    useCase = moduleRef.get(RegisterClassUseCaseImpl);
    repository = moduleRef.get(IClassRepository);
    queue = moduleRef.get(
      getQueueToken(
        PIKSLOT_EVENTS.CLASS_GROUP_ASSIGNMENT.SYNC_CLASS_CLASS_GROUPS,
      ),
    );
    // Captured once here so assertions below reference a plain variable
    // instead of the bare `queue.add` property access, which trips
    // @typescript-eslint/unbound-method on jest mocks.
    addSpy = jest.spyOn(queue, 'add');
  });

  describe('authorization', () => {
    it('allows a Platform Owner to register a class for any business', async () => {
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

    it('allows a Business Owner to register a class within their own business', async () => {
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

    it('allows an Admin to register a class within their own business', async () => {
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
      expect(addSpy).not.toHaveBeenCalled();
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

    // canRegisterClass has no allowance for Enhanced/Standard at all --
    // unlike Customer, there's no "same business" path for these roles.
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
    it('propagates an InfrastructureError from save, without enqueueing the sync job', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to save class',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest.spyOn(repository, 'save').mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute(
        buildCommand({ associatedClassGroupIds: ['class-group-1'] }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
      expect(addSpy).not.toHaveBeenCalled();
    });

    // NOTE: ClassProps documents "title should be unique per business," and
    // ClassRepositoryImpl.existsByTitle exists specifically to check that --
    // but this use case never calls it, and its Result type doesn't even
    // include a conflict error variant (only UnauthorizedError |
    // InfrastructureError). A duplicate title would only ever be caught by
    // the database's own unique constraint, surfacing here as a generic
    // InfrastructureError rather than a meaningful domain error. Flagging
    // this as a likely gap rather than fixing it silently.
    it('a duplicate title is not checked before saving (no existsByTitle call)', async () => {
      const existsByTitleSpy = jest.spyOn(repository, 'existsByTitle');

      // class-yoga-1 already has the title "Morning Yoga Flow" in business-1
      const result = await useCase.execute(
        buildCommand({
          title: 'Morning Yoga Flow',
          businessId: 'business-1',
        }),
      );

      expect(existsByTitleSpy).not.toHaveBeenCalled();
      // Succeeds despite the duplicate title, since nothing in this use
      // case checks for it.
      expect(result.ok).toBe(true);
    });
  });

  describe('successful registration', () => {
    it('builds and saves a Class entity matching the command', async () => {
      const command = buildCommand({
        title: 'New Spin Class',
        businessId: 'business-1',
        createdBy: 'user-business-owner-1',
        associatedClassGroupIds: [],
      });

      const result = await useCase.execute(command);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe('mock-generated-id');
        expect(result.value.title).toBe(command.title);
        expect(result.value.description).toBe(command.description);
        expect(result.value.durationInMins).toBe(command.durationInMins);
        expect(result.value.seats).toBe(command.seats);
        expect(result.value.cost).toBe(command.cost);
        expect(result.value.businessId).toBe(command.businessId);
        expect(result.value.createdBy).toBe(command.createdBy);
        expect(result.value.isDeleted).toBe(false);
      }

      const persisted = CLASS_TEST_DATA.find(
        (c) => c.id === 'mock-generated-id',
      );
      expect(persisted).toBeDefined();
    });

    it('does not enqueue a sync job when associatedClassGroupIds is empty', async () => {
      await useCase.execute(buildCommand({ associatedClassGroupIds: [] }));

      expect(addSpy).not.toHaveBeenCalled();
    });

    it('enqueues a class-group sync job with the correct payload when associatedClassGroupIds is non-empty', async () => {
      const command = buildCommand({
        businessId: 'business-1',
        createdBy: 'user-business-owner-1',
        associatedClassGroupIds: ['class-group-1', 'class-group-2'],
      });

      await useCase.execute(command);

      expect(addSpy).toHaveBeenCalledTimes(1);
      expect(addSpy).toHaveBeenCalledWith(
        PIKSLOT_EVENTS.CLASS_GROUP_ASSIGNMENT.SYNC_CLASS_CLASS_GROUPS,
        {
          classId: 'mock-generated-id',
          classGroupIds: command.associatedClassGroupIds,
          businessId: command.businessId,
          assignedBy: command.createdBy,
        },
      );
    });
  });
});
