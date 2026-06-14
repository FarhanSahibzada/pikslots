import type { Result } from '../../shared/result';
import type { InfrastructureError } from '../../shared';
import type { ServiceNotFoundError } from '../errors';
import type { Service } from '../service.entity';

export interface ServiceRepository {
  save(service: Service): Promise<Result<void, InfrastructureError>>;
  findById(id: string): Promise<Result<Service | null, ServiceNotFoundError | InfrastructureError>>;
  findAllByBusiness(businessId: string): Promise<Result<Service[], InfrastructureError>>;
  update(service: Service): Promise<Result<void, ServiceNotFoundError | InfrastructureError>>;
  existsByTitle(title: string, businessId: string): Promise<Result<boolean, InfrastructureError>>;
  delete(id: string): Promise<Result<void, ServiceNotFoundError | InfrastructureError>>;
}

export const IServiceRepository = Symbol('IServiceRepository');
