import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bullmq';
import {
  Class,
  ClassNotFoundError,
  EditClassCommand,
  err,
  IClassRepository,
  InfrastructureError,
  UnauthorizedError,
} from '@pikslots/domain';
import { CLASS_TEST_DATA } from '../repository/class.test.data';
import { EditClassUseCaseImpl } from './edit.class.usecase.impl';
import { ClassRepositoryTestImpl } from '../repository/class.repository.fake.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';
import {
  AUDIT_LOG_QUEUE,
  PIKSLOT_EVENTS,
} from 'src/shared/queue/jobs/pikslot.events';

function buildCommand(
  overrides: Partial<EditClassCommand> = {},
): EditClassCommand {
  return {
    id: 'class-yoga-1',
    title: 'Morning Yoga Flow - Updated',
    description: 'Updated description.',
    imagesUrls: ['https://cdn.example.com/classes/yoga-1-updated.jpg'],
    durationInMins: 75,
    seats: 18,
    cost: 25,
    isHiddenFromBookingPage: false,
    businessId: 'business-1',
    updatedBy: 'user-business-owner-1',
    associatedClassGroupIds: ['class-group-1', 'class-group-2'],
    ...overrides,
  };
}

describe('EditClassUseCaseImpl', () => {
  let useCase: EditClassUseCaseImpl;
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
        EditClassUseCaseImpl,
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

    useCase = moduleRef.get(EditClassUseCaseImpl);
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

  describe('authorization is checked before the class is looked up', () => {
    it('returns unauthorized (not class_not_found) for an unauthorized caller targeting a non-existent class', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced', // never allowed to edit, regardless of business
        businessId: 'business-1',
      });
      const findByIdSpy = jest.spyOn(repository, 'findById');

      const result = await useCase.execute(
        buildCommand({ id: 'non-existent-class', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(findByIdSpy).not.toHaveBeenCalled();
      expect(addSpy).not.toHaveBeenCalled();
    });
  });

  describe('not found', () => {
    it('returns class_not_found when the class does not exist, for an authorized caller', async () => {
      const result = await useCase.execute(
        buildCommand({ id: 'non-existent-class', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as ClassNotFoundError).kind).toBe(
          'class_not_found',
        );
      }
      expect(addSpy).not.toHaveBeenCalled();
    });
  });

  describe('authorization', () => {
    it('allows a Platform Owner to edit any class', async () => {
      Object.assign(securityContext, {
        userId: 'user-platform-owner-1',
        role: 'Platform Owner',
        businessId: 'business-999', // different business, shouldn't matter
      });

      const result = await useCase.execute(
        buildCommand({ id: 'class-business-2-1', businessId: 'business-2' }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows a Business Owner to edit a class within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ id: 'class-yoga-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows an Admin to edit a class within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ id: 'class-pilates-1', businessId: 'business-1' }),
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
        buildCommand({ id: 'class-business-2-1', businessId: 'business-2' }),
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
        buildCommand({ id: 'class-business-2-1', businessId: 'business-2' }),
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
        buildCommand({ id: 'class-yoga-1', businessId: 'business-1' }),
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
        buildCommand({ id: 'class-yoga-1', businessId: 'business-1' }),
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
      expect(addSpy).not.toHaveBeenCalled();
    });

    it('propagates an InfrastructureError from update, without enqueueing the sync job', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to update class',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest.spyOn(repository, 'update').mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
      expect(addSpy).not.toHaveBeenCalled();
    });

    it('propagates a ClassNotFoundError raised by update itself', async () => {
      const notFoundError: ClassNotFoundError = {
        kind: 'class_not_found',
        by: 'id',
        value: 'class-yoga-1',
        message: 'Class not found',
        timestamp: new Date(),
      };
      jest
        .spyOn(repository, 'update')
        .mockResolvedValueOnce(err(notFoundError));

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as ClassNotFoundError).kind).toBe(
          'class_not_found',
        );
      }
      expect(addSpy).not.toHaveBeenCalled();
    });
  });

  describe('successful edit', () => {
    it('updates the class and returns ok(undefined)', async () => {
      const updateSpy = jest.spyOn(repository, 'update');

      const command = buildCommand({
        id: 'class-yoga-1',
        title: 'Morning Yoga Flow - Updated',
        seats: 18,
        cost: 25,
      });

      const result = await useCase.execute(command);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeUndefined();
      }
      expect(updateSpy).toHaveBeenCalledTimes(1);

      const [savedArg] = updateSpy.mock.calls[0];
      expect(savedArg.id).toBe('class-yoga-1');
      expect(savedArg.title).toBe(command.title);
      expect(savedArg.seats).toBe(command.seats);
      expect(savedArg.cost).toBe(command.cost);
      expect(savedArg.updatedBy).toBe(command.updatedBy);

      // businessId and createdBy must be preserved, not overwritten
      expect(savedArg.businessId).toBe('business-1');

      const persisted = CLASS_TEST_DATA.find((c) => c.id === 'class-yoga-1');
      expect(persisted?.title).toBe(command.title);
    });

    it('enqueues a class-group sync job with the correct payload', async () => {
      const command = buildCommand({
        id: 'class-yoga-1',
        businessId: 'business-1',
        updatedBy: 'user-business-owner-1',
        associatedClassGroupIds: ['class-group-1', 'class-group-2'],
      });

      await useCase.execute(command);

      expect(addSpy).toHaveBeenCalledTimes(1);
      expect(addSpy).toHaveBeenCalledWith(
        PIKSLOT_EVENTS.CLASS_GROUP_ASSIGNMENT.SYNC_CLASS_CLASS_GROUPS,
        {
          classId: command.id,
          classGroupIds: command.associatedClassGroupIds,
          businessId: command.businessId,
          assignedBy: command.updatedBy,
        },
      );
    });

    it('still enqueues the sync job even when associatedClassGroupIds is empty, so removals are processed', async () => {
      const command = buildCommand({
        id: 'class-yoga-1',
        associatedClassGroupIds: [],
      });

      await useCase.execute(command);

      expect(addSpy).toHaveBeenCalledTimes(1);
      expect(addSpy).toHaveBeenCalledWith(
        PIKSLOT_EVENTS.CLASS_GROUP_ASSIGNMENT.SYNC_CLASS_CLASS_GROUPS,
        expect.objectContaining({ classGroupIds: [] }),
      );
    });
  });
});
