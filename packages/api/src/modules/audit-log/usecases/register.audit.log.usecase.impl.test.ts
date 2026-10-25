import { Test, TestingModule } from '@nestjs/testing';
import {
  AuditLogJobDataShape,
  err,
  IAuditLogRepository,
  InfrastructureError,
} from '@pikslots/domain';
import { AUDIT_LOG_TEST_DATA } from '../repository/audit.log.test.data';
import { AuditLogRepositoryTestImpl } from '../repository/audit.log.repository.fake.impl';
import { RegisterAuditLogUseCaseImpl } from './register.audit.log.usecase.impl';

jest.mock('uuid', () => ({
  v7: () => 'mock-generated-id',
}));

function buildCommand(
  overrides: Partial<AuditLogJobDataShape> = {},
): AuditLogJobDataShape {
  return {
    businessId: 'business-1',
    userId: 'user-standard-1',
    userType: 'user',
    action: 'audit.log.user.login',
    description: 'John Doe (john@example.com) logged in',
    entityType: 'user',
    entityId: 'user-standard-1',
    occurredAt: '2024-06-01T09:00:00.000Z',
    ...overrides,
  };
}

describe('RegisterAuditLogUseCaseImpl', () => {
  let useCase: RegisterAuditLogUseCaseImpl;
  let repository: AuditLogRepositoryTestImpl;
  let originalData: typeof AUDIT_LOG_TEST_DATA;

  beforeEach(async () => {
    if (!originalData) originalData = [...AUDIT_LOG_TEST_DATA];
    AUDIT_LOG_TEST_DATA.length = 0;
    AUDIT_LOG_TEST_DATA.push(...originalData);

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterAuditLogUseCaseImpl,
        { provide: IAuditLogRepository, useClass: AuditLogRepositoryTestImpl },
      ],
    }).compile();

    useCase = moduleRef.get(RegisterAuditLogUseCaseImpl);
    repository = moduleRef.get(IAuditLogRepository);
  });

  it('builds and saves an AuditLog entity matching the command', async () => {
    const command = buildCommand({
      ipAddress: '10.0.0.5',
      metadata: { foo: 'bar' },
    });

    const result = await useCase.execute(command);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe('mock-generated-id');
      expect(result.value.businessId).toBe(command.businessId);
      expect(result.value.userId).toBe(command.userId);
      expect(result.value.userType).toBe(command.userType);
      expect(result.value.action).toBe(command.action);
      expect(result.value.description).toBe(command.description);
      expect(result.value.entityType).toBe(command.entityType);
      expect(result.value.entityId).toBe(command.entityId);
      expect(result.value.occurredAt).toEqual(new Date(command.occurredAt));
      expect(result.value.ipAddress).toBe('10.0.0.5');
      expect(result.value.metadata).toEqual({ foo: 'bar' });
    }

    const persisted = AUDIT_LOG_TEST_DATA.find(
      (a) => a.id === 'mock-generated-id',
    );
    expect(persisted).toBeDefined();
  });

  it('defaults ipAddress and metadata to null when omitted', async () => {
    const result = await useCase.execute(buildCommand());

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.ipAddress).toBeNull();
      expect(result.value.metadata).toBeNull();
    }
  });

  it('propagates an InfrastructureError from save', async () => {
    const infraError: InfrastructureError = {
      kind: 'infrastructure',
      message: 'Failed to register audit log',
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
