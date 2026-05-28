import { Inject, Injectable } from '@nestjs/common';
import {
  IUserRepository,
  InfrastructureError,
  Result,
  User,
  UserRole,
  RoleQueryNotAuthorizedError,
} from '@pikslots/domain';
import type {
  GetAllUsersByRoleUseCase,
  UserRepository,
} from '@pikslots/domain';
import { err, ok } from '@pikslots/domain';

@Injectable()
export class GetAllUsersByRoleUseCaseImpl implements GetAllUsersByRoleUseCase {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: UserRepository,
  ) {}

  async execute(
    callerRole: UserRole,
    targetRole: UserRole,
  ): Promise<
    Result<User[], InfrastructureError | RoleQueryNotAuthorizedError>
  > {
    if (!User.canQueryRole(callerRole, targetRole)) {
      return err<RoleQueryNotAuthorizedError>({
        kind: 'role_query_not_authorized',
        message: `You are not allowed to query users with role ${targetRole}`,
        timestamp: new Date(),
        callerRole,
        queriedRole: targetRole,
      });
    }

    return this.userRepository.findAllByRole(targetRole);
  }
}
