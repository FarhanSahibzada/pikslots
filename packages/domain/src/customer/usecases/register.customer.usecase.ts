import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { FullName } from '../../shared';
import type { CustomerLinks } from '../value-objects/customer.links.vo';
import type { CustomerAlreadyExistsError } from '../errors';
import type { Customer } from '../customer.entity';

export interface RegisterCustomerCommand {
  name: FullName;
  email: string | null;
  additionalEmail: string | null;
  primaryPhone: string | null;
  additionalPhone: string | null;
  company: string | null;
  country: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  notes: string | null;
  customerSocialLinks: CustomerLinks;
  profileImageUrl: string | null;
  businessId: string;
  createdBy: string;
}

export const IRegisterCustomerUseCase = Symbol('IRegisterCustomerUseCase');

export interface RegisterCustomerUseCase {
  execute(
    command: RegisterCustomerCommand,
  ): Promise<
    Result<Customer, CustomerAlreadyExistsError | UnauthorizedError | InfrastructureError>
  >;
}
