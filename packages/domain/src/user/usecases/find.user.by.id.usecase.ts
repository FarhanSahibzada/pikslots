import type { InfrastructureError, Result } from '../../shared';
import type { UserNotFoundError } from '../errors';
import type { User } from '../user.entity';

export const IFindUserByIdUseCase = Symbol('IFindUserByIdUseCase');

export interface FindUserByIdUseCase {
  execute(userId: string): Promise<Result<User, UserNotFoundError | InfrastructureError>>;
}
