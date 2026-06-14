import type { InfrastructureError, Result } from '../../shared';
import type { ServiceUserAssignmentNotFoundError } from '../errors';

export interface RemoveUserFromServiceCommand {
  serviceId: string;
  userId: string;
  deletedBy: string;
}

export const IRemoveUserFromServiceUseCase = Symbol('IRemoveUserFromServiceUseCase');

export interface RemoveUserFromServiceUseCase {
  execute(
    command: RemoveUserFromServiceCommand,
  ): Promise<Result<void, ServiceUserAssignmentNotFoundError | InfrastructureError>>;
}
