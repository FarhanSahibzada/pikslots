import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CreateTimeoffCommand,
  err,
  InfrastructureError,
  ITimeoffRepository,
  UnauthorizedError,
} from '@pikslots/domain';
import { TIMEOFF_TEST_DATA } from '../repository/timeoff.test.data';
import { TimeOffRepositoryTestImpl } from '../repository/timeoff.repository.fake.impl';
import { RegisterTimeOffUseCaseImpl } from './register.timeoff.usecase.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { AUDIT_LOG_QUEUE } from 'src/shared/queue/jobs/pikslot.events';

jest.mock('uuid', () => ({
  v7: () => 'mock-generated-id',
}));

function buildCommand(
  overrides: Partial<CreateTimeoffCommand> = {},
): CreateTimeoffCommand {
  return {
    title: 'Winter Break',
    userId: 'user-standard-1',
    businessId: 'business-1',
    startDateTime: '2024-12-20T00:00:00Z',
    endDateTime: '2024-12-27T23:59:59Z',
    allDay: true,
    timeZone: 'UTC',
    recurrence: null,
    ...overrides,
  };
}

describe('RegisterTimeOffUseCaseImpl', () => {
  let useCase: RegisterTimeOffUseCaseImpl;
  let repository: TimeOffRepositoryTestImpl;
  let securityContext: SecurityContext;
  let originalData: typeof TIMEOFF_TEST_DATA;

  beforeEach(async () => {
    if (!originalData) originalData = [...TIMEOFF_TEST_DATA];
    TIMEOFF_TEST_DATA.length = 0;
    TIMEOFF_TEST_DATA.push(...originalData);

    securityContext = {
      userId: 'user-standard-1',
      role: 'Standard',
      businessId: 'business-1',
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterTimeOffUseCaseImpl,
        { provide: ITimeoffRepository, useClass: TimeOffRepositoryTestImpl },
        { provide: SecurityContext, useValue: securityContext },
        {
          provide: getQueueToken(AUDIT_LOG_QUEUE),
          useValue: { add: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    useCase = moduleRef.get(RegisterTimeOffUseCaseImpl);
    repository = moduleRef.get(ITimeoffRepository);
  });

  describe('authorization', () => {
    it('allows a Platform Owner to create a timeoff for anyone', async () => {
      Object.assign(securityContext, {
        userId: 'user-platform-owner-1',
        role: 'Platform Owner',
        businessId: 'business-999',
      });

      const result = await useCase.execute(
        buildCommand({ userId: 'user-standard-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows a Business Owner to create a timeoff within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ userId: 'user-standard-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('denies a Business Owner acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-2',
      });
      const saveSpy = jest.spyOn(repository, 'save');

      const result = await useCase.execute(
        buildCommand({ userId: 'user-standard-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('allows an Admin to create a timeoff within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ userId: 'user-enhanced-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('denies an Admin acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-2',
      });
      const saveSpy = jest.spyOn(repository, 'save');

      const result = await useCase.execute(
        buildCommand({ userId: 'user-enhanced-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('allows a Standard user to create a timeoff for themselves', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ userId: 'user-standard-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('denies a Standard user creating a timeoff for someone else', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });
      const saveSpy = jest.spyOn(repository, 'save');

      const result = await useCase.execute(
        buildCommand({ userId: 'user-enhanced-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('denies a Standard user creating a timeoff for themselves under a mismatched business', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-2',
      });
      const saveSpy = jest.spyOn(repository, 'save');

      const result = await useCase.execute(
        buildCommand({ userId: 'user-standard-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('allows an Enhanced user to create a timeoff for themselves', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ userId: 'user-enhanced-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('denies an Enhanced user creating a timeoff for someone else', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });
      const saveSpy = jest.spyOn(repository, 'save');

      const result = await useCase.execute(
        buildCommand({ userId: 'user-standard-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  describe('repository failures', () => {
    it('propagates an InfrastructureError from save', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to register timeoff',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest.spyOn(repository, 'save').mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
    });
  });

  describe('repository interactions', () => {
    it('calls save with a Timeoff entity built from the command, only after authorization passes', async () => {
      const saveSpy = jest.spyOn(repository, 'save');
      const command = buildCommand({
        title: 'Holiday Trip',
        userId: 'user-standard-1',
        businessId: 'business-1',
        startDateTime: '2024-12-24T00:00:00Z',
        endDateTime: '2024-12-26T23:59:59Z',
        allDay: true,
        timeZone: 'UTC',
        recurrence: null,
      });

      await useCase.execute(command);

      expect(saveSpy).toHaveBeenCalledTimes(1);
      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'mock-generated-id',
          title: command.title,
          userId: command.userId,
          businessId: command.businessId,
          startDateTime: command.startDateTime,
          endDateTime: command.endDateTime,
          allDay: command.allDay,
          timeZone: command.timeZone,
          recurrence: command.recurrence,
          createdBy: command.userId,
          updatedBy: command.userId,
        }),
      );
    });
  });

  describe('successful creation', () => {
    it('builds and saves a Timeoff entity matching the command', async () => {
      const command = buildCommand({
        title: 'New Year Break',
        userId: 'user-standard-1',
        businessId: 'business-1',
        startDateTime: '2024-12-31T00:00:00Z',
        endDateTime: '2025-01-02T23:59:59Z',
        allDay: true,
        timeZone: 'UTC',
        recurrence: null,
      });

      const result = await useCase.execute(command);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe('mock-generated-id');
        expect(result.value.title).toBe(command.title);
        expect(result.value.userId).toBe(command.userId);
        expect(result.value.businessId).toBe(command.businessId);
        expect(result.value.startDateTime).toBe(command.startDateTime);
        expect(result.value.endDateTime).toBe(command.endDateTime);
        expect(result.value.allDay).toBe(command.allDay);
        expect(result.value.timeZone).toBe(command.timeZone);
        expect(result.value.recurrence).toBeNull();
        expect(result.value.createdBy).toBe(command.userId);
        expect(result.value.updatedBy).toBe(command.userId);
        expect(result.value.isDeleted).toBe(false);
        expect(result.value.deletedAt).toBeNull();
        expect(result.value.deletedBy).toBeNull();
      }

      const persisted = TIMEOFF_TEST_DATA.find(
        (t) => t.id === 'mock-generated-id',
      );
      expect(persisted).toBeDefined();
    });

    it('creates a recurring timeoff when recurrence is provided', async () => {
      const command = buildCommand({
        title: 'Weekly Half-Day',
        recurrence: 'FREQ=WEEKLY;BYDAY=FR',
      });

      const result = await useCase.execute(command);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.recurrence).toBe('FREQ=WEEKLY;BYDAY=FR');
      }
    });
  });
});
