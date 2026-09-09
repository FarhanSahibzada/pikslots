import { type UnauthorizedError, type InfrastructureError, type Result } from '../../shared';
import type { UserNotFoundError } from '../errors';
import type { User } from '../user.entity';
import type { UserRole } from '../types';

export interface UpdateUserProfileCommand {
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email: string;
  role?: UserRole;
}

export const IUpdateUserProfileUseCase = Symbol('IUpdateUserProfileUseCase');

export interface UpdateUserProfileUseCase {
  execute(
    command: UpdateUserProfileCommand,
  ): Promise<Result<User, UserNotFoundError | UnauthorizedError | InfrastructureError>>;
}
