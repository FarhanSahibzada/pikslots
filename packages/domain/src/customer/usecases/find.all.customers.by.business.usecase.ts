import type { InfrastructureError, Result } from '../../shared';
import type { Customer } from '../customer.entity';

export const IFindAllCustomersByBusinessUseCase = Symbol('IFindAllCustomersByBusinessUseCase');

export interface FindAllCustomersByBusinessUseCase {
  execute(businessId: string): Promise<Result<Customer[], InfrastructureError>>;
}
