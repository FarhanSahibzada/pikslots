import { Inject, Injectable } from '@nestjs/common';
import {
  Customer,
  type CustomerRepository,
  FindAllCustomersByBusinessUseCase,
  ICustomerRepository,
  InfrastructureError,
  Result,
} from '@pikslots/domain';

@Injectable()
export class FindAllCustomersByBusinessUseCaseImpl implements FindAllCustomersByBusinessUseCase {
  constructor(
    @Inject(ICustomerRepository)
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(
    businessId: string,
  ): Promise<Result<Customer[], InfrastructureError>> {
    return this.customerRepository.findAllByBusiness(businessId);
  }
}
