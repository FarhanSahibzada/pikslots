import type { InfrastructureError, Result } from '../../shared';
import type { AuditLogNotFound } from '../errors';
import type { AuditLog } from '../audit.log.entity';

export interface FindAuditLogsFilter {
  businessId?: string | null;
  entityType?: string;
  entityId?: string;
  userId?: string;
  action?: string;
}

export interface AuditLogRepository {
  save(auditLog: AuditLog): Promise<Result<void, InfrastructureError>>;
  findById(id: string): Promise<Result<AuditLog, AuditLogNotFound | InfrastructureError>>;
  findAll(filter: FindAuditLogsFilter): Promise<Result<AuditLog[], InfrastructureError>>;
}

export const IAuditLogRepository = Symbol('IAuditLogRepository');
