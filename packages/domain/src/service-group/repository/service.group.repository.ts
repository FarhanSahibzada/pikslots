import type { Result } from '../../shared/result';
import type { InfrastructureError } from '../../shared';
import type {
  ServiceGroupAlreadyExistsInBusinessError,
  ServiceGroupNotFoundError,
} from '../errors';
import type { ServiceGroup } from '../service.group.entity';

export interface ServiceGroupRepository {
  save(
    group: ServiceGroup,
  ): Promise<Result<void, ServiceGroupAlreadyExistsInBusinessError | InfrastructureError>>;
  findById(
    id: string,
  ): Promise<Result<ServiceGroup | null, ServiceGroupNotFoundError | InfrastructureError>>;
  findAllByBusiness(businessId: string): Promise<Result<ServiceGroup[], InfrastructureError>>;
  update(
    group: ServiceGroup,
  ): Promise<Result<void, ServiceGroupNotFoundError | InfrastructureError>>;
  existsByName(name: string, businessId: string): Promise<Result<boolean, InfrastructureError>>;
  delete(id: string): Promise<Result<void, ServiceGroupNotFoundError | InfrastructureError>>;
}

export const IServiceGroupRepository = Symbol('IServiceGroupRepository');
