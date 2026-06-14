import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  InfrastructureError,
  IServiceGroupRepository,
  Result,
  ServiceGroupNotFoundError,
} from '@pikslots/domain';
import type {
  DeleteServiceGroupUseCase,
  ServiceGroupRepository,
} from '@pikslots/domain';

@Injectable()
export class DeleteServiceGroupUseCaseImpl implements DeleteServiceGroupUseCase {
  constructor(
    @Inject(IServiceGroupRepository)
    private readonly serviceGroupRepository: ServiceGroupRepository,
  ) {}

  async execute(
    id: string,
  ): Promise<Result<void, ServiceGroupNotFoundError | InfrastructureError>> {
    const existing = await this.serviceGroupRepository.findById(id);

    if (!existing.ok) return err(existing.error);

    if (!existing.value) {
      return err<ServiceGroupNotFoundError>({
        kind: 'service_group_not_found',
        by: 'id',
        value: id,
        message: `Service group not found against ${id}`,
        timestamp: new Date(),
      });
    }

    return await this.serviceGroupRepository.delete(id);
  }
}
