import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import {
  err,
  InfrastructureError,
  ITimeoffRepository,
  TimeOffNotFound,
  UnauthorizedError,
} from '@pikslots/domain';
import { TIMEOFF_TEST_DATA } from '../repository/timeoff.test.data';
import { TimeOffRepositoryTestImpl } from '../repository/timeoff.repository.fake.impl';
import { DeleteTimeoffUseCaseImpl } from './delete.timeoff.usecase.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { AUDIT_LOG_QUEUE } from 'src/shared/queue/jobs/pikslot.events';

describe('DeleteTimeoffUseCaseImpl', () => {
  let useCase: DeleteTimeoffUseCaseImpl;
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
        DeleteTimeoffUseCaseImpl,
        { provide: ITimeoffRepository, useClass: TimeOffRepositoryTestImpl },
        { provide: SecurityContext, useValue: securityContext },
        {
          provide: getQueueToken(AUDIT_LOG_QUEUE),
          useValue: { add: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    useCase = moduleRef.get(DeleteTimeoffUseCaseImpl);
    repository = moduleRef.get(ITimeoffRepository);
  });

  describe('authorization', () => {
    it('allows a Platform Owner to delete any timeoff regardless of business', async () => {
      Object.assign(securityContext, {
        userId: 'user-platform-owner-1',
        role: 'Platform Owner',
        businessId: 'business-999',
      });

      const result = await useCase.execute('timeoff-1');

      expect(result.ok).toBe(true);
    });

    it('allows a Business Owner to delete a timeoff within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });

      const result = await useCase.execute('timeoff-1'); // belongs to user-standard-1, business-1

      expect(result.ok).toBe(true);
    });

    it('denies a Business Owner acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-2',
      });
      const deleteSpy = jest.spyOn(repository, 'delete');

      const result = await useCase.execute('timeoff-1'); // business-1

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('allows an Admin to delete a timeoff within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-1',
      });

      const result = await useCase.execute('timeoff-3'); // user-enhanced-1, business-1

      expect(result.ok).toBe(true);
    });

    it('denies an Admin acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-2',
      });
      const deleteSpy = jest.spyOn(repository, 'delete');

      const result = await useCase.execute('timeoff-3'); // business-1

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('allows a Standard user to delete their own timeoff', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });

      const result = await useCase.execute('timeoff-1'); // owned by user-standard-1

      expect(result.ok).toBe(true);
    });

    it("denies a Standard user deleting someone else's timeoff, even in the same business", async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });
      const deleteSpy = jest.spyOn(repository, 'delete');

      const result = await useCase.execute('timeoff-3'); // owned by user-enhanced-1

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('denies a Standard user deleting their own timeoff from a different business context', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-2',
      });
      const deleteSpy = jest.spyOn(repository, 'delete');

      const result = await useCase.execute('timeoff-1'); // record's businessId is business-1

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('allows an Enhanced user to delete their own timeoff', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });

      const result = await useCase.execute('timeoff-3'); // owned by user-enhanced-1

      expect(result.ok).toBe(true);
    });

    it("denies an Enhanced user deleting someone else's timeoff", async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });
      const deleteSpy = jest.spyOn(repository, 'delete');

      const result = await useCase.execute('timeoff-1'); // owned by user-standard-1

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(deleteSpy).not.toHaveBeenCalled();
    });
  });

  describe('not found', () => {
    it('returns TimeOffNotFound when the timeoff does not exist', async () => {
      const result = await useCase.execute('timeoff-nonexistent');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as TimeOffNotFound).kind).toBe(
          'timeoff_not_found',
        );
      }
    });

    it('returns TimeOffNotFound for a soft-deleted timeoff (findById excludes deleted rows)', async () => {
      const result = await useCase.execute('timeoff-4'); // soft-deleted in fixture

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as TimeOffNotFound).kind).toBe(
          'timeoff_not_found',
        );
      }
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
      const deleteSpy = jest.spyOn(repository, 'delete');

      const result = await useCase.execute('timeoff-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('propagates a TimeOffNotFound error surfaced directly from findById', async () => {
      const notFoundError: TimeOffNotFound = {
        kind: 'timeoff_not_found',
        message: 'Timeoff not found',
        by: 'id',
        timestamp: new Date(),
        value: 'timeoff-1',
      };
      jest
        .spyOn(repository, 'findById')
        .mockResolvedValueOnce(err(notFoundError));
      const deleteSpy = jest.spyOn(repository, 'delete');

      const result = await useCase.execute('timeoff-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(notFoundError);
      }
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('propagates an InfrastructureError from delete', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to delete timeoff',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest.spyOn(repository, 'delete').mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute('timeoff-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
    });

    it('propagates a TimeOffNotFound error from delete (e.g. race condition after findById)', async () => {
      const notFoundError: TimeOffNotFound = {
        kind: 'timeoff_not_found',
        by: 'id',
        value: 'timeoff-1',
        message: 'Timeoff not found against timeoff-1',
        timestamp: new Date(),
      };
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValueOnce(err(notFoundError));

      const result = await useCase.execute('timeoff-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(notFoundError);
      }
    });
  });

  describe('repository interactions', () => {
    it('calls findById with the given id', async () => {
      const findByIdSpy = jest.spyOn(repository, 'findById');

      await useCase.execute('timeoff-1');

      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(findByIdSpy).toHaveBeenCalledWith('timeoff-1');
    });

    it('calls delete with the found timeoff id only after authorization passes', async () => {
      const deleteSpy = jest.spyOn(repository, 'delete');

      await useCase.execute('timeoff-1');

      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith('timeoff-1');
    });
  });

  describe('successful deletion', () => {
    it('returns ok(undefined) and removes the timeoff from the store', async () => {
      const result = await useCase.execute('timeoff-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeUndefined();
      }

      const stillExists = TIMEOFF_TEST_DATA.find((t) => t.id === 'timeoff-1');
      expect(stillExists).toBeUndefined();
    });
  });
});
