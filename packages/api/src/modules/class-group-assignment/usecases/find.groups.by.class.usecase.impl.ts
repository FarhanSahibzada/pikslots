import { Inject, Injectable } from '@nestjs/common';
import {
  ClassGroupSummary,
  err,
  FindGroupsByClassUseCase,
  IClassGroupAssignmentRepository,
  InfrastructureError,
  ok,
  Result,
} from '@pikslots/domain';
import type { ClassGroupAssignmentRepository } from '@pikslots/domain';

@Injectable()
export class FindGroupsByClassUseCaseImpl implements FindGroupsByClassUseCase {
  constructor(
    @Inject(IClassGroupAssignmentRepository)
    private readonly assignmentRepository: ClassGroupAssignmentRepository,
  ) {}

  async execute(
    classId: string,
  ): Promise<Result<ClassGroupSummary[], InfrastructureError>> {
    const result = await this.assignmentRepository.findGroupsByClass(classId);

    if (!result.ok) return err(result.error);

    return ok(result.value);
  }
}
