import type { InfrastructureError, Result } from '../../shared';
import type { ServiceGroupNotFoundError } from '../errors';

export const IDeleteServiceGroupUseCase = Symbol('IDeleteServiceGroupUseCase');

export interface DeleteServiceGroupUseCase {
  execute(id: string): Promise<Result<void, ServiceGroupNotFoundError | InfrastructureError>>;
}
