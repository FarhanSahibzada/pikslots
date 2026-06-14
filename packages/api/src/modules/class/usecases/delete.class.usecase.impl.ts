import { Inject, Injectable } from '@nestjs/common';
import {
  Class,
  ClassNotFoundError,
  DeleteClassUseCase,
  err,
  IClassRepository,
  InfrastructureError,
  ok,
  Result,
} from '@pikslots/domain';
import type { ClassRepository, UnauthorizedError } from '@pikslots/domain';
import { SecurityContext } from 'src/shared/security/context/security.context';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'Can not register service : unauthorized!!!',
  timestamp: new Date(),
};

const CLASS_NOT_FOUND_ERROR: ClassNotFoundError = {
  kind: 'class_not_found',
  by: 'id',
  message: 'Failed to find the class',
  value: 'Failed to find the class',
  timestamp: new Date(),
};

@Injectable()
export class DeleteClassUseCaseImpl implements DeleteClassUseCase {
  constructor(
    @Inject(IClassRepository)
    private readonly classRepository: ClassRepository,
    private readonly securityContext: SecurityContext,
  ) {}

  async execute(
    id: string,
  ): Promise<
    Result<void, ClassNotFoundError | UnauthorizedError | InfrastructureError>
  > {
    const classFound = await this.classRepository.findById(id);

    if (!classFound.ok) return err(classFound.error);

    if (!classFound.value) return err(CLASS_NOT_FOUND_ERROR);

    const callerRole = this.securityContext.role;
    const callerBusinessId = this.securityContext.businessId;
    const isPartOfSameBusiness =
      callerBusinessId === classFound.value.businessId;

    if (!Class.canDeleteClass(callerRole, isPartOfSameBusiness))
      return err(UNAUTHORIZED_ERROR);

    const result = await this.classRepository.delete(id);

    if (!result.ok) return err(result.error);

    return ok(result.value);
  }
}
