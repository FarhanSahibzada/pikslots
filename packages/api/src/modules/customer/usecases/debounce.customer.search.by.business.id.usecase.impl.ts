import { Inject, Injectable } from '@nestjs/common';
import {
  DebounceCustomerSearchByBusinessIdUseCase,
  err,
  FullName,
  ICustomerRepository,
  InfrastructureError,
  ok,
  Result,
} from '@pikslots/domain';
import type { CustomerRepository } from '@pikslots/domain';

@Injectable()
export class DebounceCustomerSearchByBusinessIdUseCaseImpl implements DebounceCustomerSearchByBusinessIdUseCase {
  constructor(
    @Inject(ICustomerRepository)
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(
    businessId: string,
    searchString: string,
  ): Promise<
    Result<
      {
        id: string;
        fullName: FullName;
        profileImageUrl: string | null;
        email: string | null;
      }[],
      InfrastructureError
    >
  > {
    const customersFound =
      await this.customerRepository.debounceCustomerSearchByBusiness(
        businessId,
        searchString,
      );

    if (!customersFound.ok) return err(customersFound.error);

    if (!customersFound.value) return ok([]);

    return ok(customersFound.value);
  }
}
