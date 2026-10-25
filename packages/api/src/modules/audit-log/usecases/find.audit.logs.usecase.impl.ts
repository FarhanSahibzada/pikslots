import { Inject, Injectable } from '@nestjs/common';
import {
  AuditLog,
  err,
  FindAuditLogsCommand,
  FindAuditLogsUseCase,
  IAuditLogRepository,
  InfrastructureError,
  Result,
  UnauthorizedError,
} from '@pikslots/domain';
import type { AuditLogRepository } from '@pikslots/domain';
import { SecurityContext } from 'src/shared/security/context/security.context';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'Can not view audit logs : unauthorized!!!',
  timestamp: new Date(),
};

@Injectable()
export class FindAuditLogsUseCaseImpl implements FindAuditLogsUseCase {
  constructor(
    @Inject(IAuditLogRepository)
    private readonly auditLogRepository: AuditLogRepository,
    private readonly securityContext: SecurityContext,
  ) {}

  async execute(
    command: FindAuditLogsCommand,
  ): Promise<Result<AuditLog[], UnauthorizedError | InfrastructureError>> {
    const callerRole = this.securityContext.role;
    const isPartOfSameBusiness =
      this.securityContext.businessId === command.businessId;

    if (!AuditLog.canViewAuditLogs(callerRole, isPartOfSameBusiness))
      return err(UNAUTHORIZED_ERROR);

    return await this.auditLogRepository.findAll(command);
  }
}
