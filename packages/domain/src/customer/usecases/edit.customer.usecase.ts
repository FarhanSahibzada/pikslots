import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { FullName } from '../../shared';
import type { CustomerLinks } from '../value-objects/customer.links.vo';
import type { CustomerNotFoundError } from '../errors';

export interface EditCustomerCommand {
  id: string;
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
  updatedBy: string;
}

export const IEditCustomerUseCase = Symbol('IEditCustomerUseCase');

export interface EditCustomerUseCase {
  execute(
    command: EditCustomerCommand,
  ): Promise<Result<void, CustomerNotFoundError | UnauthorizedError | InfrastructureError>>;
}
