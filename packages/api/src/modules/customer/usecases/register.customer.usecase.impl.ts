import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  ok,
  Customer,
  CustomerAlreadyExistsError,
  RegisterCustomerCommand,
  RegisterCustomerUseCase,
  type CustomerRepository,
  ICustomerRepository,
  InfrastructureError,
  Result,
  UnauthorizedError,
} from '@pikslots/domain';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { v7 as uuidv7 } from 'uuid';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'Can not register customer : unauthorized!!!',
  timestamp: new Date(),
};

@Injectable()
export class RegisterCustomerUseCaseImpl implements RegisterCustomerUseCase {
  constructor(
    @Inject(ICustomerRepository)
    private readonly customerRepository: CustomerRepository,
    private readonly securityContext: SecurityContext,
  ) {}

  async execute(
    command: RegisterCustomerCommand,
  ): Promise<
    Result<
      Customer,
      CustomerAlreadyExistsError | UnauthorizedError | InfrastructureError
    >
  > {
    const callerRole = this.securityContext.role;
    const callerBusinessId = this.securityContext.businessId;
    const isPartOfSameBusiness = callerBusinessId === command.businessId;

    if (!Customer.canRegisterCustomer(callerRole, isPartOfSameBusiness))
      return err(UNAUTHORIZED_ERROR);

    const customer = Customer.create({
      id: uuidv7(),
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
      businessId: command.businessId,
      createdBy: command.createdBy,
    });

    const saved = await this.customerRepository.save(customer);

    if (!saved.ok) return err(saved.error);

    return ok(customer);
  }
}
