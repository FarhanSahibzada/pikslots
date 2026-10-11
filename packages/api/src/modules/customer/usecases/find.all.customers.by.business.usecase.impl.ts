import { Inject, Injectable } from '@nestjs/common';
import {
  Customer,
  type CustomerRepository,
  err,
  FindAllCustomersByBusinessUseCase,
  FullName,
  ICustomerRepository,
  InfrastructureError,
  Result,
  UnauthorizedError,
} from '@pikslots/domain';
import { SecurityContext } from 'src/shared/security/context/security.context';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'Access Denied',
  timestamp: new Date(),
};

@Injectable()
export class FindAllCustomersByBusinessUseCaseImpl implements FindAllCustomersByBusinessUseCase {
  constructor(
    @Inject(ICustomerRepository)
    private readonly customerRepository: CustomerRepository,
    private readonly securityContext: SecurityContext,
  ) {}

  async execute(businessId: string): Promise<
    Result<
      {
        id: string;
        fullName: FullName;
        profileImageUrl: string | null;
        email: string | null;
      }[],
      InfrastructureError | UnauthorizedError
    >
  > {
    const callerRole = this.securityContext.role;
    const callerBusinessId = this.securityContext.businessId;
    const isPartOfSameBusiness = callerBusinessId === businessId;

    if (!Customer.canViewCustomer(callerRole, isPartOfSameBusiness))
      return err(UNAUTHORIZED_ERROR);

    return await this.customerRepository.findCustomerListByBusiness(businessId);
  }
}
