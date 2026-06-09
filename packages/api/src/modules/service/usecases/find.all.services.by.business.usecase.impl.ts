import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  InfrastructureError,
  IServiceRepository,
  ok,
  Result,
  FindAllServicesByBusinessUseCase,
  Service,
} from '@pikslots/domain';
import type { ServiceRepository } from '@pikslots/domain';

@Injectable()
export class FindAllServicesByBusinessUseCaseImpl implements FindAllServicesByBusinessUseCase {
  constructor(
    @Inject(IServiceRepository)
    private readonly serviceRepository: ServiceRepository,
  ) {}

  async execute(
    businessId: string,
  ): Promise<Result<Service[], InfrastructureError>> {
    const services = await this.serviceRepository.findAllByBusiness(businessId);

    if (!services.ok) return err(services.error);

    return ok(services.value);
  }
}
