import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  GetUserProfileUseCase,
  IGetUserProfileUseCase,
  InfrastructureError,
  IUserRepository,
  ok,
  Result,
  User,
  UserInactiveError,
  UserNotFoundError,
  UserSuspendedError,
} from '@pikslots/domain';
import type { UserRepository } from '@pikslots/domain';

@Injectable()
export class GetUserProfileUseCaseImpl implements GetUserProfileUseCase {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: UserRepository,
  ) {}

  async execute(
    userId: string,
  ): Promise<
    Result<
      User,
      | UserNotFoundError
      | UserSuspendedError
      | UserInactiveError
      | InfrastructureError
    >
  > {
    const result = await this.userRepository.findById(userId);
    if (!result.ok) return err(result.error);

    const user = result.value;

    if (!user || user.isDeleted)
      return err<UserNotFoundError>({
        kind: 'user_not_found',
        message: `User not found by id: ${userId}`,
        by: 'id',
        value: userId,
        timestamp: new Date(),
      });

    if (user.status === 'suspended')
      return err<UserSuspendedError>({
        kind: 'user_suspended',
        message: 'This account has been suspended',
        reason: user.suspendedReason,
        timestamp: new Date(),
      });

    if (user.status === 'inactive' || user.status === 'invited')
      return err<UserInactiveError>({
        kind: 'user_inactive',
        message: 'This account is not yet active',
        status: 'inactive',
        timestamp: new Date(),
      });

    return ok(user);
  }
}
