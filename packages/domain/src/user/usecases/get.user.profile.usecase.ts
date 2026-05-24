import type { InfrastructureError, Result } from '../../shared';
import type { UserInactiveError, UserNotFoundError, UserSuspendedError } from '../errors';
import type { User } from '../user.entity';

export const IGetUserProfileUseCase = Symbol('IGetUserProfileUseCase');

export interface GetUserProfileUseCase {
  execute(
    userId: string,
  ): Promise<
    Result<User, UserNotFoundError | UserSuspendedError | UserInactiveError | InfrastructureError>
  >;
}
