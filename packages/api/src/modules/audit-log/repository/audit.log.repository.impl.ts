import { Inject, Injectable } from '@nestjs/common';
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
import { AuditLogPersistenceMapper } from '../mappers/audit.log.database.mapper';
import { PIKSLOTS_DB } from 'src/shared/database/pikslots.database.module';
import { Kysely } from 'kysely';
import { PikSlotsDatabase } from 'src/shared/database/schema';

@Injectable()
export class AuditLogRepositoryImpl implements AuditLogRepository {
  private readonly mapper = new AuditLogPersistenceMapper();
  constructor(@Inject(PIKSLOTS_DB) readonly db: Kysely<PikSlotsDatabase>) {}

  async save(auditLog: AuditLog): Promise<Result<void, InfrastructureError>> {
    try {
      await this.db
        .insertInto('audit_logs')
        .values(this.mapper.domainToPersistence(auditLog))
        .execute();
      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to register audit log',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findById(
    id: string,
  ): Promise<Result<AuditLog, AuditLogNotFound | InfrastructureError>> {
    try {
      const row = await this.db
        .selectFrom('audit_logs')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst();
      if (!row) {
        return err<AuditLogNotFound>({
          kind: 'audit_log_not_found',
          message: 'Audit log not found',
          by: 'id',
          timestamp: new Date(),
          value: id,
        });
      }
      return ok(this.mapper.persistenceToDomain(row));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to get audit log by id',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findAll(
    filter: FindAuditLogsFilter,
  ): Promise<Result<AuditLog[], InfrastructureError>> {
    try {
      let query = this.db.selectFrom('audit_logs').selectAll();

      if (filter.businessId !== undefined)
        query = query.where('business_id', '=', filter.businessId);
      if (filter.entityType)
        query = query.where('entity_type', '=', filter.entityType);
      if (filter.entityId)
        query = query.where('entity_id', '=', filter.entityId);
      if (filter.userId) query = query.where('user_id', '=', filter.userId);
      if (filter.action) query = query.where('action', '=', filter.action);

      const rows = await query.orderBy('occurred_at', 'desc').execute();
      return ok(rows.map((row) => this.mapper.persistenceToDomain(row)));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to get audit logs',
        timestamp: new Date(),
        cause,
      });
    }
  }
}
