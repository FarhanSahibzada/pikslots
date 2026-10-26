import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import {
  err,
  IServiceRepository,
  InfrastructureError,
  Service,
  ServiceNotFoundError,
  UnauthorizedError,
} from '@pikslots/domain';
import { SERVICE_TEST_DATA } from '../repository/service.test.data';
import { DeleteServiceUseCaseImpl } from './delete.service.usecase.impl';
import { ServiceRepositoryTestImpl } from '../repository/service.repository.fake.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { AUDIT_LOG_QUEUE } from 'src/shared/queue/jobs/pikslot.events';

describe('DeleteServiceUseCaseImpl', () => {
  let useCase: DeleteServiceUseCaseImpl;
  let repository: ServiceRepositoryTestImpl;
  let securityContext: SecurityContext;
  let originalData: Service[];

  beforeEach(async () => {
    // Snapshot once, restore before every test so delete() in one test
    // can't remove fixtures that a later test still relies on.
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
        DeleteServiceUseCaseImpl,
        { provide: IServiceRepository, useClass: ServiceRepositoryTestImpl },
        { provide: SecurityContext, useValue: securityContext },
        {
          provide: getQueueToken(AUDIT_LOG_QUEUE),
          useValue: { add: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    useCase = moduleRef.get(DeleteServiceUseCaseImpl);
    repository = moduleRef.get(IServiceRepository);
  });

  describe('not found', () => {
    it('returns service_not_found when the service does not exist', async () => {
      const deleteSpy = jest.spyOn(repository, 'delete');

      const result = await useCase.execute('non-existent-service');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        // NOTE: SERVICE_NOT_FOUND_ERROR is a shared module-level constant
        // whose `value` field is hardcoded to a message string rather than
        // the actual id that was looked up (same issue flagged in
        // DeleteClassUseCaseImpl). Only asserting on `kind` here.
        expect((result.error as ServiceNotFoundError).kind).toBe(
          'service_not_found',
        );
      }
      expect(deleteSpy).not.toHaveBeenCalled();
    });
  });

  describe('authorization', () => {
    it('allows a Platform Owner to delete any service', async () => {
      Object.assign(securityContext, {
        userId: 'user-platform-owner-1',
        role: 'Platform Owner',
        businessId: 'business-999', // different business, shouldn't matter
      });

      const result = await useCase.execute('service-haircut-1');

      expect(result.ok).toBe(true);
    });

    it('allows a Business Owner to delete a service within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });

      const result = await useCase.execute('service-massage-1');

      expect(result.ok).toBe(true);
    });

    it('allows an Admin to delete a service within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-1',
      });

      const result = await useCase.execute('service-consultation-1');

      expect(result.ok).toBe(true);
    });

    it('denies a Business Owner acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });
      const deleteSpy = jest.spyOn(repository, 'delete');

      const result = await useCase.execute('service-business-2-1');

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

      const result = await useCase.execute('service-business-2-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    // canDeleteService has no allowance for Enhanced/Standard at all --
    // there's no "same business" path for these roles.
    it('denies an Enhanced user even within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });
      const deleteSpy = jest.spyOn(repository, 'delete');

      const result = await useCase.execute('service-haircut-1');

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

      const result = await useCase.execute('service-haircut-1');

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

      const result = await useCase.execute('service-haircut-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('propagates an InfrastructureError from delete', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to delete service',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest.spyOn(repository, 'delete').mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute('service-haircut-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
    });

    it('propagates a ServiceNotFoundError raised by delete itself', async () => {
      const notFoundError: ServiceNotFoundError = {
        kind: 'service_not_found',
        by: 'id',
        value: 'service-haircut-1',
        message: 'Service not found',
        timestamp: new Date(),
      };
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValueOnce(err(notFoundError));

      const result = await useCase.execute('service-haircut-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as ServiceNotFoundError).kind).toBe(
          'service_not_found',
        );
      }
    });
  });

  describe('successful deletion', () => {
    it('deletes the service and returns ok(undefined)', async () => {
      const deleteSpy = jest.spyOn(repository, 'delete');

      const result = await useCase.execute('service-massage-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeUndefined();
      }
      expect(deleteSpy).toHaveBeenCalledWith('service-massage-1');

      const persisted = SERVICE_TEST_DATA.find(
        (s) => s.id === 'service-massage-1',
      );
      expect(persisted).toBeUndefined();
    });
  });
});
