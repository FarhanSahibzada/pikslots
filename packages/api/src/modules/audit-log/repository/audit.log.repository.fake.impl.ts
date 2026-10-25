// audit.log.repository.fake.impl.ts
import {
  AuditLog,
  AuditLogNotFound,
  AuditLogRepository,
  err,
  FindAuditLogsFilter,
  InfrastructureError,
  ok,
  Result,
} from '@pikslots/domain';
import { AUDIT_LOG_TEST_DATA } from './audit.log.test.data';

/**
 * In-memory fake for AuditLogRepository, used for unit testing use cases.
 * Audit logs are append-only, so there is no update/delete surface to mirror.
 */
export class AuditLogRepositoryTestImpl implements AuditLogRepository {
  async save(auditLog: AuditLog): Promise<Result<void, InfrastructureError>> {
    await Promise.resolve('');
    AUDIT_LOG_TEST_DATA.push(auditLog);
    return ok(undefined);
  }

  async findById(
    id: string,
  ): Promise<Result<AuditLog, AuditLogNotFound | InfrastructureError>> {
    await Promise.resolve('');
    const found = AUDIT_LOG_TEST_DATA.find((a) => a.id === id);
    if (!found) {
      return err<AuditLogNotFound>({
        kind: 'audit_log_not_found',
        message: 'Audit log not found',
        by: 'id',
        timestamp: new Date(),
        value: id,
      });
    }
    return ok(found);
  }

  async findAll(
    filter: FindAuditLogsFilter,
  ): Promise<Result<AuditLog[], InfrastructureError>> {
    await Promise.resolve('');
    const rows = AUDIT_LOG_TEST_DATA.filter(
      (a) =>
        (filter.businessId === undefined || a.businessId === filter.businessId) &&
        (!filter.entityType || a.entityType === filter.entityType) &&
        (!filter.entityId || a.entityId === filter.entityId) &&
        (!filter.userId || a.userId === filter.userId) &&
        (!filter.action || a.action === filter.action),
    );
    return ok(rows);
  }
}
