import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  ok,
  InfrastructureError,
  IServiceUserAssignmentRepository,
  Result,
  FindServicesByUserUseCase,
  ServiceSummary,
} from '@pikslots/domain';
import type { ServiceUserAssignmentRepository } from '@pikslots/domain';

@Injectable()
export class FindServicesByUserUseCaseImpl implements FindServicesByUserUseCase {
  constructor(
    @Inject(IServiceUserAssignmentRepository)
    private readonly assignmentRepository: ServiceUserAssignmentRepository,
  ) {}

  async execute(userId: string): Promise<Result<ServiceSummary[], InfrastructureError>> {
    const result = await this.assignmentRepository.findServicesByUser(userId);

    if (!result.ok) return err(result.error);

    return ok(result.value);
  }
}
