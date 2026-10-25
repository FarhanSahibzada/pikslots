import { Test, TestingModule } from '@nestjs/testing';
import {
  AuditLogJobDataShape,
  err,
  IAuditLogRepository,
  InfrastructureError,
} from '@pikslots/domain';
import { AUDIT_LOG_TEST_DATA } from '../repository/audit.log.test.data';
import { AuditLogRepositoryTestImpl } from '../repository/audit.log.repository.fake.impl';
import { UserLogoutAuditLogEventImpl } from './user.logout.audit.log.event.impl';
import { PIKSLOT_EVENTS } from 'src/shared/queue/jobs/pikslot.events';
import type { AuditLogJob } from 'src/shared/queue/jobs';

jest.mock('uuid', () => ({
  v7: () => 'mock-generated-id',
}));

function buildJob(overrides: Partial<AuditLogJobDataShape> = {}): AuditLogJob {
  return {
    data: {
      businessId: 'business-1',
      userId: 'user-standard-1',
      userType: 'user',
      action: PIKSLOT_EVENTS.AUDIT_LOG.USER_LOGOUT,
      description: 'John Doe (john@example.com) logged out',
      entityType: 'user',
      entityId: 'user-standard-1',
      occurredAt: '2024-06-01T17:00:00.000Z',
      ...overrides,
    },
  } as AuditLogJob;
}

describe('UserLogoutAuditLogEventImpl', () => {
  let processor: UserLogoutAuditLogEventImpl;
  let repository: AuditLogRepositoryTestImpl;
  let originalData: typeof AUDIT_LOG_TEST_DATA;

  beforeEach(async () => {
    if (!originalData) originalData = [...AUDIT_LOG_TEST_DATA];
    AUDIT_LOG_TEST_DATA.length = 0;
    AUDIT_LOG_TEST_DATA.push(...originalData);

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UserLogoutAuditLogEventImpl,
        { provide: IAuditLogRepository, useClass: AuditLogRepositoryTestImpl },
      ],
    }).compile();

    processor = moduleRef.get(UserLogoutAuditLogEventImpl);
    repository = moduleRef.get(IAuditLogRepository);
  });

  it('persists an AuditLog entity built from the job payload, without going through a use case', async () => {
    const job = buildJob({ ipAddress: '10.0.0.5', metadata: { foo: 'bar' } });
    const saveSpy = jest.spyOn(repository, 'save');

    await processor.process(job);

    expect(saveSpy).toHaveBeenCalledTimes(1);
    const persisted = AUDIT_LOG_TEST_DATA.find(
      (a) => a.id === 'mock-generated-id',
    );
    expect(persisted).toBeDefined();
    expect(persisted?.businessId).toBe(job.data.businessId);
    expect(persisted?.userId).toBe(job.data.userId);
    expect(persisted?.action).toBe(job.data.action);
    expect(persisted?.entityType).toBe(job.data.entityType);
    expect(persisted?.entityId).toBe(job.data.entityId);
    expect(persisted?.ipAddress).toBe('10.0.0.5');
    expect(persisted?.metadata).toEqual({ foo: 'bar' });
  });

  it('throws when the repository fails to save', async () => {
    const infraError: InfrastructureError = {
      kind: 'infrastructure',
      message: 'Failed to register audit log',
      timestamp: new Date(),
      cause: new Error('boom'),
    };
    jest.spyOn(repository, 'save').mockResolvedValueOnce(err(infraError));

    await expect(processor.process(buildJob())).rejects.toThrow(
      JSON.stringify(infraError),
    );
  });
});
