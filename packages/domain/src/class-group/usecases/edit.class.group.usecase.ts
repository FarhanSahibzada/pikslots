import type { InfrastructureError, Result } from '../../shared';
import type { ClassGroupAlreadyExistsInBusinessError, ClassGroupNotFoundError } from '../errors';

export interface EditClassGroupCommand {
  classGroupId: string;
  name: string;
  classIds: string[];
  businessId: string;
  updatedBy: string;
}

export const IEditClassGroupUseCase = Symbol('IEditClassGroupUseCase');

export interface EditClassGroupUseCase {
  execute(
    command: EditClassGroupCommand,
  ): Promise<
    Result<
      void,
      ClassGroupNotFoundError | ClassGroupAlreadyExistsInBusinessError | InfrastructureError
    >
  >;
}
