import { Inject, Injectable } from '@nestjs/common';
import {
  ClassGroupNotFoundError,
  err,
  IClassGroupRepository,
  InfrastructureError,
  Result,
} from '@pikslots/domain';
import type { DeleteClassGroupUseCase } from '@pikslots/domain';
import type { ClassGroupRepository } from '@pikslots/domain';

@Injectable()
export class DeleteClassGroupUseCaseImpl implements DeleteClassGroupUseCase {
  constructor(
    @Inject(IClassGroupRepository)
    private readonly classGroupRepository: ClassGroupRepository,
  ) {}

  async execute(
    id: string,
  ): Promise<Result<void, ClassGroupNotFoundError | InfrastructureError>> {
    const existing = await this.classGroupRepository.findById(id);

    if (!existing.ok) return err(existing.error);

    if (!existing.value) {
      return err<ClassGroupNotFoundError>({
        kind: 'class_group_not_found',
        by: 'id',
        value: id,
        message: `Class group not found against ${id}`,
        timestamp: new Date(),
      });
    }

    return await this.classGroupRepository.delete(id);
  }
}
