import type { InfrastructureError, Result, ServiceSummary } from '../../shared';
import type { ServiceGroupAssignment } from '../service.group.assignment.entity';
import type { ServiceGroupSummary } from '../read-models/service.group.summary';

export const IServiceGroupAssignmentRepository = Symbol('IServiceGroupAssignmentRepository');

export interface ServiceGroupAssignmentRepository {
  save(membership: ServiceGroupAssignment): Promise<Result<void, InfrastructureError>>;
  saveAll(membership: ServiceGroupAssignment[]): Promise<Result<void, InfrastructureError>>;
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
  findGroupsByService(
    serviceId: string,
  ): Promise<Result<ServiceGroupSummary[], InfrastructureError>>;
  findServicesByGroup(
    serviceGroupId: string,
  ): Promise<Result<ServiceSummary[], InfrastructureError>>;
  update(membership: ServiceGroupAssignment): Promise<Result<void, InfrastructureError>>;
  deleteById(id: string): Promise<Result<void, InfrastructureError>>;
}
