import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import {
  Class,
  ClassNotFoundError,
  err,
  IClassRepository,
  InfrastructureError,
  UnauthorizedError,
} from '@pikslots/domain';
import { CLASS_TEST_DATA } from '../repository/class.test.data';
import { DeleteClassUseCaseImpl } from './delete.class.usecase.impl';
import { ClassRepositoryTestImpl } from '../repository/class.repository.fake.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { AUDIT_LOG_QUEUE } from 'src/shared/queue/jobs/pikslot.events';

describe('DeleteClassUseCaseImpl', () => {
  let useCase: DeleteClassUseCaseImpl;
  let repository: ClassRepositoryTestImpl;
  let securityContext: SecurityContext;
  let originalData: Class[];

  beforeEach(async () => {
    // Snapshot once, restore before every test so delete() in one test
    // can't remove fixtures that a later test still relies on.
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
        DeleteClassUseCaseImpl,
        { provide: IClassRepository, useClass: ClassRepositoryTestImpl },
        { provide: SecurityContext, useValue: securityContext },
        {
          provide: getQueueToken(AUDIT_LOG_QUEUE),
          useValue: { add: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    useCase = moduleRef.get(DeleteClassUseCaseImpl);
    repository = moduleRef.get(IClassRepository);
  });

  describe('not found', () => {
    it('returns class_not_found when the class does not exist', async () => {
      const deleteSpy = jest.spyOn(repository, 'delete');

      const result = await useCase.execute('non-existent-class');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as ClassNotFoundError).kind).toBe(
          'class_not_found',
        );
      }
      expect(deleteSpy).not.toHaveBeenCalled();
    });
  });

  describe('authorization', () => {
    it('allows a Platform Owner to delete any class', async () => {
      Object.assign(securityContext, {
        userId: 'user-platform-owner-1',
        role: 'Platform Owner',
        businessId: 'business-999', // different business, shouldn't matter
      });

      const result = await useCase.execute('class-yoga-1');

      expect(result.ok).toBe(true);
    });

    it('allows a Business Owner to delete a class within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });

      const result = await useCase.execute('class-pilates-1');

      expect(result.ok).toBe(true);
    });

    it('allows an Admin to delete a class within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-1',
      });

      const result = await useCase.execute('class-hiit-1');

      expect(result.ok).toBe(true);
    });

    it('denies a Business Owner acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });
      const deleteSpy = jest.spyOn(repository, 'delete');

      const result = await useCase.execute('class-business-2-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('denies an Admin acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-1',
      });
      const deleteSpy = jest.spyOn(repository, 'delete');

      const result = await useCase.execute('class-business-2-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    // canDeleteClass has no allowance for Enhanced/Standard at all --
    // unlike Customer, there's no "same business" path for these roles.
    it('denies an Enhanced user even within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });
      const deleteSpy = jest.spyOn(repository, 'delete');

      const result = await useCase.execute('class-yoga-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('denies a Standard user even within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });
      const deleteSpy = jest.spyOn(repository, 'delete');

      const result = await useCase.execute('class-yoga-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(deleteSpy).not.toHaveBeenCalled();
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

      const result = await useCase.execute('class-yoga-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    // Unlike DeleteBreakUseCaseImpl, this use case DOES check the result of
    // delete() and correctly propagates a failure, rather than swallowing it.
    it('propagates an InfrastructureError from delete', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to delete class',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest.spyOn(repository, 'delete').mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute('class-yoga-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
    });

    it('propagates a ClassNotFoundError raised by delete itself', async () => {
      const notFoundError: ClassNotFoundError = {
        kind: 'class_not_found',
        by: 'id',
        value: 'class-yoga-1',
        message: 'Class not found',
        timestamp: new Date(),
      };
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValueOnce(err(notFoundError));

      const result = await useCase.execute('class-yoga-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as ClassNotFoundError).kind).toBe(
          'class_not_found',
        );
      }
    });
  });

  describe('successful deletion', () => {
    it('deletes the class and returns ok(undefined)', async () => {
      const deleteSpy = jest.spyOn(repository, 'delete');

      const result = await useCase.execute('class-pilates-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeUndefined();
      }
      expect(deleteSpy).toHaveBeenCalledWith('class-pilates-1');

      const persisted = CLASS_TEST_DATA.find((c) => c.id === 'class-pilates-1');
      expect(persisted).toBeUndefined();
    });
  });
});
