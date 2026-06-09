import type { InfrastructureError, Result } from '../../shared';
import type { ServiceGroupAssignmentNotFoundError } from '../errors';

export interface RemoveServiceFromGroupCommand {
  serviceId: string;
  serviceGroupId: string;
  deletedBy: string;
}

export const IRemoveServiceFromGroupUseCase = Symbol('IRemoveServiceFromGroupUseCase');

export interface RemoveServiceFromGroupUseCase {
  execute(
    command: RemoveServiceFromGroupCommand,
  ): Promise<Result<void, ServiceGroupAssignmentNotFoundError | InfrastructureError>>;
}
