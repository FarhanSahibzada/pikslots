import type { InfrastructureError, Result } from '../../shared';
import type { UserNotFoundError, WorkingHoursUpdateNotAuthorizedError } from '../errors';
import type { User } from '../user.entity';
import type { UserWorkingHours } from '../value-objects/user.working.hours.vo';

export interface UpdateUserWorkingHoursCommand {
  userId: string;
  userWorkingHours: UserWorkingHours;
}

export const IUpdateUserWorkingHoursUseCase = Symbol('IUpdateUserWorkingHoursUseCase');

export interface UpdateUserWorkingHoursUseCase {
  execute(
    command: UpdateUserWorkingHoursCommand,
  ): Promise<
    Result<User, UserNotFoundError | WorkingHoursUpdateNotAuthorizedError | InfrastructureError>
  >;
}
