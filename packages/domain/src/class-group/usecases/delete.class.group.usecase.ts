import type { InfrastructureError, Result } from '../../shared';
import type { ClassGroupNotFoundError } from '../errors';

export const IDeleteClassGroupUseCase = Symbol('IDeleteClassGroupUseCase');

export interface DeleteClassGroupUseCase {
  execute(id: string): Promise<Result<void, ClassGroupNotFoundError | InfrastructureError>>;
}
