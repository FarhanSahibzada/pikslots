import { Inject, Injectable } from '@nestjs/common';
import {
  ClassGroup,
  err,
  IClassGroupRepository,
  InfrastructureError,
  ok,
  Result,
} from '@pikslots/domain';
import type { FindAllClassGroupsByBusinessUseCase } from '@pikslots/domain';
import type { ClassGroupRepository } from '@pikslots/domain';

@Injectable()
export class FindAllClassGroupsByBusinessUseCaseImpl implements FindAllClassGroupsByBusinessUseCase {
  constructor(
    @Inject(IClassGroupRepository)
    private readonly classGroupRepository: ClassGroupRepository,
  ) {}

  async execute(
    businessId: string,
  ): Promise<Result<ClassGroup[], InfrastructureError>> {
    const result =
      await this.classGroupRepository.findAllByBusiness(businessId);

    if (!result.ok) return err(result.error);

    return ok(result.value);
  }
}
