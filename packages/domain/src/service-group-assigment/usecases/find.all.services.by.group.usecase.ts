import type { InfrastructureError, Result } from '../../shared';
import type { ServiceGroupAssignment } from '../service.group.assignment.entity';

export const IFindServicesByGroupUseCase = Symbol('IFindServicesByGroupUseCase');

export interface FindServicesByGroupUseCase {
  execute(serviceGroupId: string): Promise<Result<ServiceGroupAssignment[], InfrastructureError>>;
}
