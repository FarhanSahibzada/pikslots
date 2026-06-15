import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  ok,
  InfrastructureError,
  IServiceGroupAssignmentRepository,
  Result,
  FindGroupsByServiceUseCase,
  ServiceGroupSummary,
} from '@pikslots/domain';
import type { ServiceGroupAssignmentRepository } from '@pikslots/domain';

@Injectable()
export class FindGroupsByServiceUseCaseImpl implements FindGroupsByServiceUseCase {
  constructor(
    @Inject(IServiceGroupAssignmentRepository)
    private readonly assignmentRepository: ServiceGroupAssignmentRepository,
  ) {}

  async execute(
    serviceId: string,
  ): Promise<Result<ServiceGroupSummary[], InfrastructureError>> {
    const result =
      await this.assignmentRepository.findGroupsByService(serviceId);

    if (!result.ok) return err(result.error);

    return ok(result.value);
  }
}
