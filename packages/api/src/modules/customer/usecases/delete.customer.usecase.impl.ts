import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  ok,
  Customer,
  CustomerNotFoundError,
  DeleteCustomerCommand,
  DeleteCustomerUseCase,
  type CustomerRepository,
  ICustomerRepository,
  InfrastructureError,
  Result,
  UnauthorizedError,
} from '@pikslots/domain';
import { SecurityContext } from 'src/shared/security/context/security.context';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'Can not delete customer : unauthorized!!!',
  timestamp: new Date(),
};

@Injectable()
export class DeleteCustomerUseCaseImpl implements DeleteCustomerUseCase {
  constructor(
    @Inject(ICustomerRepository)
    private readonly customerRepository: CustomerRepository,
    private readonly securityContext: SecurityContext,
  ) {}

  async execute(
    command: DeleteCustomerCommand,
  ): Promise<
    Result<
      void,
      CustomerNotFoundError | UnauthorizedError | InfrastructureError
    >
  > {
    const callerRole = this.securityContext.role;
    const callerBusinessId = this.securityContext.businessId;
    const isPartOfSameBusiness = callerBusinessId === command.businessId;

    if (!Customer.canDeleteCustomer(callerRole, isPartOfSameBusiness))
      return err(UNAUTHORIZED_ERROR);

    const found = await this.customerRepository.findById(command.id);

    if (!found.ok) return err(found.error);

    if (!found.value) {
      return err({
        kind: 'customer_not_found',
        message: `Customer not found by id: ${command.id}`,
        timestamp: new Date(),
        by: 'id',
        value: command.id,
      } satisfies CustomerNotFoundError);
    }

    const softDeleted = found.value.softDelete(command.deletedBy);

    const saved = await this.customerRepository.update(softDeleted);

    if (!saved.ok) return err(saved.error);

    return ok(undefined);
  }
}
