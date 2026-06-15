import type { InfrastructureError, UnauthorizedError, Result } from '../../shared';
import type { UserInactiveError, UserNoAccessError, UserSuspendedError } from '../errors';

export interface LoginUserCommand {
  usernameOrEmail: string;
  password: string;
}

export const ILoginUserUseCase = Symbol('ILoginUserUseCase');

export interface LoginUserUseCase {
  execute(
    command: LoginUserCommand,
  ): Promise<
    Result<
      { accessToken: string; refreshToken: string },
      | UnauthorizedError
      | UserSuspendedError
      | UserInactiveError
      | UserNoAccessError
      | InfrastructureError
    >
  >;
}
