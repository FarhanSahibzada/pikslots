import { Inject, Injectable } from '@nestjs/common';
import {
  AuditLog,
  type AuditLogRepository,
  err,
  IAuditLogRepository,
  InfrastructureError,
  ok,
  RegisterAuditLogCommand,
  RegisterAuditLogUseCase,
  Result,
} from '@pikslots/domain';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class RegisterAuditLogUseCaseImpl implements RegisterAuditLogUseCase {
  constructor(
    @Inject(IAuditLogRepository)
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(
    command: RegisterAuditLogCommand,
  ): Promise<Result<AuditLog, InfrastructureError>> {
    const auditLog = AuditLog.create({
      id: uuidv7(),
      businessId: command.businessId,
      userId: command.userId,
      userType: command.userType,
      action: command.action,
      description: command.description,
      entityType: command.entityType,
      entityId: command.entityId,
      occurredAt: command.occurredAt,
      ipAddress: command.ipAddress,
      metadata: command.metadata,
    });

    const saved = await this.auditLogRepository.save(auditLog);

    if (!saved.ok) return err(saved.error);

    return ok(auditLog);
  }
}
