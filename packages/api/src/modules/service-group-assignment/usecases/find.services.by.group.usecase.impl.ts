import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  ok,
  InfrastructureError,
  IServiceGroupAssignmentRepository,
  Result,
  FindServicesByGroupUseCase,
  ServiceSummary,
} from '@pikslots/domain';
import type { ServiceGroupAssignmentRepository } from '@pikslots/domain';

@Injectable()
export class FindServicesByGroupUseCaseImpl implements FindServicesByGroupUseCase {
  constructor(
    @Inject(IServiceGroupAssignmentRepository)
    private readonly assignmentRepository: ServiceGroupAssignmentRepository,
  ) {}

  async execute(
    serviceGroupId: string,
  ): Promise<Result<ServiceSummary[], InfrastructureError>> {
    const result =
      await this.assignmentRepository.findServicesByGroup(serviceGroupId);

    if (!result.ok) return err(result.error);

    return ok(result.value);
  }
}
