import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  ok,
  InfrastructureError,
  IServiceGroupAssignmentRepository,
  Result,
  ServiceGroupAssignment,
  FindServicesByGroupUseCase,
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
  ): Promise<Result<ServiceGroupAssignment[], InfrastructureError>> {
    const result =
      await this.assignmentRepository.findAllByServiceGroup(serviceGroupId);

    if (!result.ok) return err(result.error);

    const active = result.value.filter((a) => !a.isDeleted);

    return ok(active);
  }
}
