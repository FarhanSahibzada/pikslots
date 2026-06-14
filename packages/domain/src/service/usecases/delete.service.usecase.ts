import { type UnauthorizedError, type InfrastructureError, type Result } from '../../shared';
import type { ServiceNotFoundError } from '../errors';

export const IDeleteServiceUseCase = Symbol('IDeleteServiceUseCase');

export interface DeleteServiceUseCase {
  execute(
    id: string,
  ): Promise<Result<void, ServiceNotFoundError | UnauthorizedError | InfrastructureError>>;
}
