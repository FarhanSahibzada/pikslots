import type { InfrastructureError, Result } from '../../shared';
import type { ServiceGroupAssignment } from '../service.group.assignment.entity';

export const IServiceGroupAssignmentRepository = Symbol('IServiceGroupAssignmentRepository');

export interface ServiceGroupAssignmentRepository {
  save(membership: ServiceGroupAssignment): Promise<Result<void, InfrastructureError>>;
  findById(id: string): Promise<Result<ServiceGroupAssignment | null, InfrastructureError>>;
  findAllByServiceGroup(
    serviceGroupId: string,
  ): Promise<Result<ServiceGroupAssignment[], InfrastructureError>>;
  findAllByService(
    serviceId: string,
  ): Promise<Result<ServiceGroupAssignment[], InfrastructureError>>;
  findAllByBusiness(
    businessId: string,
  ): Promise<Result<ServiceGroupAssignment[], InfrastructureError>>;
  findByServiceAndGroup(
    serviceId: string,
    serviceGroupId: string,
  ): Promise<Result<ServiceGroupAssignment | null, InfrastructureError>>;
  existsByServiceAndGroup(
    serviceId: string,
    serviceGroupId: string,
  ): Promise<Result<boolean, InfrastructureError>>;
  update(membership: ServiceGroupAssignment): Promise<Result<void, InfrastructureError>>;
}
