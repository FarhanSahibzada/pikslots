import type { InfrastructureError, Result } from '../../shared';
import type { AuditLogJobDataShape } from '../../shared';
import type { AuditLog } from '../audit.log.entity';

export type RegisterAuditLogCommand = AuditLogJobDataShape;

export const IRegisterAuditLogUseCase = Symbol('IRegisterAuditLogUseCase');

export interface RegisterAuditLogUseCase {
  execute(command: RegisterAuditLogCommand): Promise<Result<AuditLog, InfrastructureError>>;
}
