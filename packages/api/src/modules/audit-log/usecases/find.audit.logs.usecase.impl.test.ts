import { Test, TestingModule } from '@nestjs/testing';
import { IAuditLogRepository, UnauthorizedError } from '@pikslots/domain';
import { AUDIT_LOG_TEST_DATA } from '../repository/audit.log.test.data';
import { AuditLogRepositoryTestImpl } from '../repository/audit.log.repository.fake.impl';
import { FindAuditLogsUseCaseImpl } from './find.audit.logs.usecase.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';

describe('FindAuditLogsUseCaseImpl', () => {
  let useCase: FindAuditLogsUseCaseImpl;
  let repository: AuditLogRepositoryTestImpl;
  let securityContext: SecurityContext;
  let originalData: typeof AUDIT_LOG_TEST_DATA;

  beforeEach(async () => {
    if (!originalData) originalData = [...AUDIT_LOG_TEST_DATA];
    AUDIT_LOG_TEST_DATA.length = 0;
    AUDIT_LOG_TEST_DATA.push(...originalData);

    securityContext = {
      userId: 'user-platform-owner-1',
      role: 'Platform Owner',
      businessId: null,
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindAuditLogsUseCaseImpl,
        { provide: IAuditLogRepository, useClass: AuditLogRepositoryTestImpl },
        { provide: SecurityContext, useValue: securityContext },
      ],
    }).compile();

    useCase = moduleRef.get(FindAuditLogsUseCaseImpl);
    repository = moduleRef.get(IAuditLogRepository);
  });

  describe('authorization', () => {
    it('allows a Platform Owner to view audit logs for any business', async () => {
      const result = await useCase.execute({ businessId: 'business-1' });

      expect(result.ok).toBe(true);
    });

    it('allows a Platform Owner to view audit logs across all businesses', async () => {
      const result = await useCase.execute({});

      expect(result.ok).toBe(true);
    });

    it.each(['Business Owner', 'Admin'] as const)(
      'allows a %s to view audit logs for their own business',
      async (role) => {
        Object.assign(securityContext, { role, businessId: 'business-1' });

        const result = await useCase.execute({ businessId: 'business-1' });

        expect(result.ok).toBe(true);
      },
    );

    it.each(['Business Owner', 'Admin'] as const)(
      'denies a %s from viewing audit logs for a different business',
      async (role) => {
        Object.assign(securityContext, { role, businessId: 'business-1' });
        const findAllSpy = jest.spyOn(repository, 'findAll');

        const result = await useCase.execute({ businessId: 'business-2' });

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
        }
        expect(findAllSpy).not.toHaveBeenCalled();
      },
    );

    it.each(['Enhanced', 'Standard', 'No Access'] as const)(
      'denies a %s from viewing audit logs even for their own business',
      async (role) => {
        Object.assign(securityContext, { role, businessId: 'business-1' });
        const findAllSpy = jest.spyOn(repository, 'findAll');

        const result = await useCase.execute({ businessId: 'business-1' });

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
        }
        expect(findAllSpy).not.toHaveBeenCalled();
      },
    );
  });

  describe('filtering', () => {
    it('returns logs matching the given filter', async () => {
      const result = await useCase.execute({ userId: 'user-standard-1' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
        expect(result.value.every((a) => a.userId === 'user-standard-1')).toBe(
          true,
        );
      }
    });

    it('returns all logs when no filter is given', async () => {
      const result = await useCase.execute({});

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(AUDIT_LOG_TEST_DATA.length);
      }
    });
  });
});
