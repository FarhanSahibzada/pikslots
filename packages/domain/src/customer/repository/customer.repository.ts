import type { Result } from '../../shared/result';
import type { InfrastructureError } from '../../shared';
import type { CustomerAlreadyExistsError, CustomerNotFoundError } from '../errors';
import type { Customer } from '../customer.entity';

export interface CustomerRepository {
  save(customer: Customer): Promise<Result<void, CustomerAlreadyExistsError | InfrastructureError>>;
  findById(
    id: string,
  ): Promise<Result<Customer | null, CustomerNotFoundError | InfrastructureError>>;
  findAllByBusiness(businessId: string): Promise<Result<Customer[], InfrastructureError>>;
  update(customer: Customer): Promise<Result<void, CustomerNotFoundError | InfrastructureError>>;
  delete(id: string): Promise<Result<void, CustomerNotFoundError | InfrastructureError>>;
  existsByEmail(email: string, businessId: string): Promise<Result<boolean, InfrastructureError>>;
}

export const ICustomerRepository = Symbol('ICustomerRepository');
