import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  ok,
  Customer,
  CustomerNotFoundError,
  EditCustomerCommand,
  EditCustomerUseCase,
  type CustomerRepository,
  ICustomerRepository,
  InfrastructureError,
  Result,
  UnauthorizedError,
} from '@pikslots/domain';
import { SecurityContext } from 'src/shared/security/context/security.context';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'Can not edit customer : unauthorized!!!',
  timestamp: new Date(),
};

@Injectable()
export class EditCustomerUseCaseImpl implements EditCustomerUseCase {
  constructor(
    @Inject(ICustomerRepository)
    private readonly customerRepository: CustomerRepository,
    private readonly securityContext: SecurityContext,
  ) {}

  async execute(
    command: EditCustomerCommand,
  ): Promise<
    Result<
      void,
      CustomerNotFoundError | UnauthorizedError | InfrastructureError
    >
  > {
    const callerRole = this.securityContext.role;
    const callerBusinessId = this.securityContext.businessId;
    const isPartOfSameBusiness = callerBusinessId === command.businessId;

    if (!Customer.canEditCustomer(callerRole, isPartOfSameBusiness))
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

    const updated = found.value.update({
      name: command.name,
      profileImageUrl: command.profileImageUrl,
      email: command.email,
      additionalEmail: command.additionalEmail,
      primaryPhone: command.primaryPhone,
      additionalPhone: command.additionalPhone,
      company: command.company,
      country: command.country,
      address: command.address,
      city: command.city,
      state: command.state,
      zipCode: command.zipCode,
      notes: command.notes,
      customerSocialLinks: command.customerSocialLinks,
      updatedBy: command.updatedBy,
    });

    const saved = await this.customerRepository.update(updated);

    if (!saved.ok) return err(saved.error);

    return ok(undefined);
  }
}
