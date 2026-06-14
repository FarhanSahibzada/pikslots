import type { InfrastructureError, Result, ServiceSummary } from '../../shared';
import type { ServiceUserAssignment } from '../service.user.assignment.entity';
import type { UserSummary } from '../read-models/user.summary';

export const IServiceUserAssignmentRepository = Symbol('IServiceUserAssignmentRepository');

export interface ServiceUserAssignmentRepository {
  save(assignment: ServiceUserAssignment): Promise<Result<void, InfrastructureError>>;
  saveAll(assignments: ServiceUserAssignment[]): Promise<Result<void, InfrastructureError>>;
  findById(id: string): Promise<Result<ServiceUserAssignment | null, InfrastructureError>>;
  findAllByService(
    serviceId: string,
  ): Promise<Result<ServiceUserAssignment[], InfrastructureError>>;
  findAllByUser(userId: string): Promise<Result<ServiceUserAssignment[], InfrastructureError>>;
  findAllByBusiness(
    businessId: string,
  ): Promise<Result<ServiceUserAssignment[], InfrastructureError>>;
  findByServiceAndUser(
    serviceId: string,
    userId: string,
  ): Promise<Result<ServiceUserAssignment | null, InfrastructureError>>;
  existsByServiceAndUser(
    serviceId: string,
    userId: string,
  ): Promise<Result<boolean, InfrastructureError>>;
  findUsersByService(serviceId: string): Promise<Result<UserSummary[], InfrastructureError>>;
  findServicesByUser(userId: string): Promise<Result<ServiceSummary[], InfrastructureError>>;
  update(assignment: ServiceUserAssignment): Promise<Result<void, InfrastructureError>>;
  deleteById(id: string): Promise<Result<void, InfrastructureError>>;
}
