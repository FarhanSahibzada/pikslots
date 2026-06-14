import { Inject, Injectable } from '@nestjs/common';
import {
  Class,
  err,
  FindAllClassesByBusinessUseCase,
  IClassRepository,
  InfrastructureError,
  ok,
  Result,
} from '@pikslots/domain';

import type { ClassRepository } from '@pikslots/domain';
@Injectable()
export class FindAllClassesByBusinessUseCaseImpl implements FindAllClassesByBusinessUseCase {
  constructor(
    @Inject(IClassRepository)
    private readonly classRepository: ClassRepository,
  ) {}

  async execute(
    businessId: string,
  ): Promise<Result<Class[], InfrastructureError>> {
    const classes = await this.classRepository.findAllByBusiness(businessId);

    if (!classes.ok) return err(classes.error);

    return ok(classes.value);
  }
}
