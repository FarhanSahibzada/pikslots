import type { InfrastructureError, Result } from '../../shared';
import type { InviterNotAuthorizedError, UserAlreadyExistsError } from '../errors';
import type { UserRole } from '../user.entity';

export interface InviteUserCommand {
  email: string;
  username: string;
  name: { firstName: string; lastName: string };
  role: UserRole;
  phone?: string;
}

export const IInviteUserUseCase = Symbol('IInviteUserUseCase');

export interface InviteUserUseCase {
  execute(
    command: InviteUserCommand,
  ): Promise<
    Result<
      { message: 'success' },
      UserAlreadyExistsError | InviterNotAuthorizedError | InfrastructureError
    >
  >;
}
