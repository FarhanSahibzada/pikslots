import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { CustomerNotFoundError } from '../errors';

export interface DeleteCustomerCommand {
  id: string;
  businessId: string;
  deletedBy: string;
}

export const IDeleteCustomerUseCase = Symbol('IDeleteCustomerUseCase');

export interface DeleteCustomerUseCase {
  execute(
    command: DeleteCustomerCommand,
  ): Promise<Result<void, CustomerNotFoundError | UnauthorizedError | InfrastructureError>>;
}
