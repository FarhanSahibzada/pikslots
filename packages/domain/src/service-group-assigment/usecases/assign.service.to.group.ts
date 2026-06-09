import type { InfrastructureError, Result } from '../../shared';
import type { ServiceGroupAssigmentAlreadyExistsError } from '../errors';
import type { ServiceGroupAssignment } from '../service.group.assignment.entity';

export interface AssignServiceToGroupCommand {
  serviceId: string;
  serviceGroupId: string;
  businessId: string;
  createdBy: string;
}

export const IAssignServiceToGroupUseCase = Symbol('IAssignServiceToGroupUseCase');

export interface AssignServiceToGroupUseCase {
  execute(
    command: AssignServiceToGroupCommand,
  ): Promise<
    Result<ServiceGroupAssignment, ServiceGroupAssigmentAlreadyExistsError | InfrastructureError>
  >;
}
