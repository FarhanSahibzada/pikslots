import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { FindAuditLogsFilter } from '../repository';
import type { AuditLog } from '../audit.log.entity';

export type FindAuditLogsCommand = FindAuditLogsFilter;

export const IFindAuditLogsUseCase = Symbol('IFindAuditLogsUseCase');

export interface FindAuditLogsUseCase {
  execute(
    command: FindAuditLogsCommand,
  ): Promise<Result<AuditLog[], UnauthorizedError | InfrastructureError>>;
}
