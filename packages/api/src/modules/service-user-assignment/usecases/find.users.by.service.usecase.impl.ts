import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  ok,
  InfrastructureError,
  IServiceUserAssignmentRepository,
  Result,
  FindUsersByServiceUseCase,
  UserSummary,
} from '@pikslots/domain';
import type { ServiceUserAssignmentRepository } from '@pikslots/domain';

@Injectable()
export class FindUsersByServiceUseCaseImpl implements FindUsersByServiceUseCase {
  constructor(
    @Inject(IServiceUserAssignmentRepository)
    private readonly assignmentRepository: ServiceUserAssignmentRepository,
  ) {}

  async execute(
    serviceId: string,
  ): Promise<Result<UserSummary[], InfrastructureError>> {
    const result =
      await this.assignmentRepository.findUsersByService(serviceId);

    if (!result.ok) return err(result.error);

    return ok(result.value);
  }
}
