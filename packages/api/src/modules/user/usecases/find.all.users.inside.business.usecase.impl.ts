import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  InfrastructureError,
  IUserRepository,
  ok,
  Result,
  User,
  FindAllUsersInsideBusinessUseCase,
} from '@pikslots/domain';
import type { UnauthorizedError, UserRepository } from '@pikslots/domain';
import { SecurityContext } from 'src/shared/security/context/security.context';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'can not get business users',
  timestamp: new Date(),
};
@Injectable()
export class FindAllUsersInsideBusinessUseCaseImpl implements FindAllUsersInsideBusinessUseCase {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: UserRepository,
    private readonly securityContext: SecurityContext,
  ) {}

  async execute(
    businessId: string,
  ): Promise<Result<User[], InfrastructureError | UnauthorizedError>> {
    if (this.securityContext.role === 'No Access')
      return err(UNAUTHORIZED_ERROR);

    const result = await this.userRepository.findAllByBusiness(businessId);

    if (!result.ok) return err(result.error);

    return ok(result.value);
  }
}
