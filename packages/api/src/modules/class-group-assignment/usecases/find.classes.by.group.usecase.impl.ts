import { Inject, Injectable } from '@nestjs/common';
import {
  ClassSummary,
  err,
  FindClassesByGroupUseCase,
  IClassGroupAssignmentRepository,
  InfrastructureError,
  ok,
  Result,
} from '@pikslots/domain';
import type { ClassGroupAssignmentRepository } from '@pikslots/domain';

@Injectable()
export class FindClassesByGroupUseCaseImpl implements FindClassesByGroupUseCase {
  constructor(
    @Inject(IClassGroupAssignmentRepository)
    private readonly assignmentRepository: ClassGroupAssignmentRepository,
  ) {}

  async execute(
    classGroupId: string,
  ): Promise<Result<ClassSummary[], InfrastructureError>> {
    const result =
      await this.assignmentRepository.findClassesByGroup(classGroupId);

    if (!result.ok) return err(result.error);

    return ok(result.value);
  }
}
