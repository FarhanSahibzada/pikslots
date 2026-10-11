import { Inject, Injectable } from '@nestjs/common';
import {
  IUserRepository,
  InfrastructureError,
  Result,
  User,
  err,
  ok,
} from '@pikslots/domain';
import type {
  UserNotFoundError,
  UpdateUserProfileCommand,
  UpdateUserProfileUseCase,
  UserRepository,
  UnauthorizedError,
} from '@pikslots/domain';
import { SecurityContext } from 'src/shared/security/context/security.context';

@Injectable()
export class UpdateUserProfileUseCaseImpl implements UpdateUserProfileUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: UserRepository,
    private readonly securityContext: SecurityContext,
  ) {}

  async execute(
    command: UpdateUserProfileCommand,
  ): Promise<
    Result<User, UserNotFoundError | UnauthorizedError | InfrastructureError>
  > {
    const findResult = await this.userRepository.findById(command.userId);
    if (!findResult.ok) return err(findResult.error as InfrastructureError);

    const target = findResult.value;

    if (!target) {
      return err<UserNotFoundError>({
        kind: 'user_not_found',
        by: 'id',
        value: command.userId,
        message: `User not found against ${command.userId}`,
        timestamp: new Date(),
      });
    }

    const callerRole = this.securityContext.role;
    const isSelf = this.securityContext.userId === command.userId;
    const isPartOfSameBusiness =
      this.securityContext.businessId === target.businessId;

    if (!User.canUpdateProfile(callerRole, isSelf, isPartOfSameBusiness)) {
      return err<UnauthorizedError>({
        kind: 'unauthorized',
        message: `Cannot perform the operation. Role: ${this.securityContext.role}`,
        timestamp: new Date(),
      });
    }

    const updated = target.updateProfile({
      name: { firstName: command.firstName, lastName: command.lastName },
      phone: command.phone ?? null,
      email: command.email,
      role: command.role,
      updatedBy: this.securityContext.userId,
    });

    const updateResult = await this.userRepository.update(updated);

    if (!updateResult.ok) return err(updateResult.error);

    return ok(updated);
  }
}
