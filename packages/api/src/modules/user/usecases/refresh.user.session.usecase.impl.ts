import { Inject, Injectable } from '@nestjs/common';
import { err, IUserRepository, ok } from '@pikslots/domain';
import type {
  InfrastructureError,
  RefreshUserSessionCommand,
  RefreshUserSessionUseCase,
  Result,
  UnauthorizedError,
  User,
  UserInactiveError,
  UserNotFoundError,
  UserRepository,
  UserSuspendedError,
  ValidationError,
} from '@pikslots/domain';
import { LoginJwtPayload } from '@pikslots/shared';
import { JwtLoginService } from 'src/shared/security/jwt/jwt.login.service';

type RefreshError =
  | UnauthorizedError
  | ValidationError
  | InfrastructureError
  | UserNotFoundError
  | UserInactiveError
  | UserSuspendedError;

type RefreshResult = Result<
  { accessToken: string; refreshToken: string },
  RefreshError
>;

const USER_NOT_FOUND = (): UserNotFoundError => ({
  kind: 'user_not_found',
  message: 'user not found',
  by: 'id',
  value: 'user not found',
  timestamp: new Date(),
});

@Injectable()
export class RefreshUserSessionUseCaseImpl implements RefreshUserSessionUseCase {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: UserRepository,
    private readonly jwtLoginService: JwtLoginService,
  ) {}

  async execute(command: RefreshUserSessionCommand): Promise<RefreshResult> {
    // Step 1: verify the refresh token signature and expiry
    const tokenResult = this.jwtLoginService.verifyRefreshToken(
      command.currentRefreshToken,
    );
    if (!tokenResult.ok) return err(tokenResult.error);

    const userResult = await this.userRepository.findById(
      tokenResult.value.userId,
    );

    if (!userResult.ok) return err(userResult.error);
    if (!userResult.value) return err(USER_NOT_FOUND());

    // Step 3: issue a fresh token pair (rotation)
    return this.issueTokens(userResult.value);
  }

  private issueTokens(user: User): RefreshResult {
    const payload: LoginJwtPayload = { userId: user.id, role: user.role };
    return ok({
      accessToken: this.jwtLoginService.signAccessToken(payload),
      refreshToken: this.jwtLoginService.signRefreshToken(payload),
    });
  }
}
