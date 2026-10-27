import {
  AuditLogTableInsert,
  AuditLogTableSelect,
} from 'src/shared/database/schema/audit.log.table';
import { AuditLog } from '@pikslots/domain';

export class AuditLogPersistenceMapper {
  public persistenceToDomain(row: AuditLogTableSelect): AuditLog {
    return AuditLog.reconstitute({
      id: row.id,
      businessId: row.business_id,
      userId: row.user_id,
      userType: row.user_type,
      action: row.action,
      description: row.description,
      entityType: row.entity_type,
      entityId: row.entity_id,
      occurredAt: row.occurred_at,
      ipAddress: row.ip_address,
      metadata: row.metadata,
      createdAt: row.created_at,
    });
  }

  public domainToPersistence(auditLog: AuditLog): AuditLogTableInsert {
    return {
      id: auditLog.id,
      business_id: auditLog.businessId,
      user_id: auditLog.userId,
      user_type: auditLog.userType,
      action: auditLog.action,
      description: auditLog.description,
      entity_type: auditLog.entityType,
      entity_id: auditLog.entityId,
      occurred_at: auditLog.occurredAt,
      ip_address: auditLog.ipAddress,
      metadata: auditLog.metadata,
      created_at: auditLog.createdAt,
    };
  }
}
