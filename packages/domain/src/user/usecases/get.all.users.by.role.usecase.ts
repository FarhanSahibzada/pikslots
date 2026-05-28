import type { InfrastructureError, Result } from '../../shared';
import type { User, UserRole } from '../user.entity';
import type { RoleQueryNotAuthorizedError } from '../errors';

export const IGetAllUsersByRole = Symbol('IGetAllUsersByRole');

export interface GetAllUsersByRoleUseCase {
  execute(
    callerRole: UserRole,
    targetRole: UserRole,
  ): Promise<Result<User[], InfrastructureError | RoleQueryNotAuthorizedError>>;
}
