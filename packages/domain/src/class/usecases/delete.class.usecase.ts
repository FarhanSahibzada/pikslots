import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { ClassNotFoundError } from '../errors';

export const IDeleteClassUseCase = Symbol('IDeleteClassUseCase');

export interface DeleteClassUseCase {
  execute(
    id: string,
  ): Promise<Result<void, ClassNotFoundError | UnauthorizedError | InfrastructureError>>;
}
