import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  InfrastructureError,
  IServiceGroupRepository,
  ok,
  Result,
  ServiceGroup,
} from '@pikslots/domain';
import type {
  FindAllServiceGroupsByBusinessUseCase,
  ServiceGroupRepository,
} from '@pikslots/domain';

@Injectable()
export class FindAllServiceGroupsByBusinessUseCaseImpl implements FindAllServiceGroupsByBusinessUseCase {
  constructor(
    @Inject(IServiceGroupRepository)
    private readonly serviceGroupRepository: ServiceGroupRepository,
  ) {}
  async execute(
    businessId: string,
  ): Promise<Result<ServiceGroup[], InfrastructureError>> {
    const allServiceGroupsByBusiness =
      await this.serviceGroupRepository.findAllByBusiness(businessId);

    if (!allServiceGroupsByBusiness.ok)
      return err(allServiceGroupsByBusiness.error);

    return ok(allServiceGroupsByBusiness.value);
  }
}
