import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  FindUserByIdUseCase,
  InfrastructureError,
  IUserRepository,
  ok,
  Result,
  User,
  UserNotFoundError,
} from '@pikslots/domain';
import type { UserRepository } from '@pikslots/domain';

@Injectable()
export class FindUserByIdUseCaseImpl implements FindUserByIdUseCase {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: UserRepository,
  ) {}

  async execute(
    userId: string,
  ): Promise<Result<User, UserNotFoundError | InfrastructureError>> {
    const result = await this.userRepository.findById(userId);

    if (!result.ok) return err(result.error);

    if (!result.value)
      return err<UserNotFoundError>({
        kind: 'user_not_found',
        message: `User not found by id: ${userId}`,
        by: 'id',
        value: userId,
        timestamp: new Date(),
      });

    return ok(result.value);
  }
}
