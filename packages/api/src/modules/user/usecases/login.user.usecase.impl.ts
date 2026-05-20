import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  InfrastructureError,
  IUserRepository,
  LoginUserUseCase,
  ok,
  Result,
} from '@pikslots/domain';
import type {
  LoginUserCommand,
  UnauthorizedError,
  User,
  UserInactiveError,
  UserRepository,
  UserSuspendedError,
} from '@pikslots/domain';
import { LoginJwtPayload } from '@pikslots/shared';
import { PasswordHashingService } from 'src/shared/security/hashing/password.hashing.service';
import { JwtLoginService } from 'src/shared/security/jwt/jwt.login.service';

type LoginError =
  | UnauthorizedError
  | InfrastructureError
  | UserSuspendedError
  | UserInactiveError;
type LoginResult = Result<
  { accessToken: string; refreshToken: string },
  LoginError
>;

const ACCESS_DENIED = (): UnauthorizedError => ({
  kind: 'unauthorized',
  message: 'Access denied : please provide valid credentials',
  timestamp: new Date(),
});

const USER_INACTIVE = (): UserInactiveError => ({
  kind: 'user_inactive',
  message: 'User is inactive',
  status: 'inactive',
  timestamp: new Date(),
});

const USER_SUSPENDED = (reason: string): UserSuspendedError => ({
  kind: 'user_suspended',
  reason,
  message: 'User is suspended',
  timestamp: new Date(),
});

@Injectable()
export class LoginUserUseCaseImpl implements LoginUserUseCase {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: UserRepository,
    private readonly jwtLoginService: JwtLoginService,
    private readonly passwordHashingService: PasswordHashingService,
  ) {}

  async execute(command: LoginUserCommand): Promise<LoginResult> {
    const user = await this.findUser(command.usernameOrEmail);
    if (!user.ok) return user;

    const passwordMatches = await this.passwordHashingService.compare(
      command.password,
      user.value.password,
    );
    if (!passwordMatches) return err(ACCESS_DENIED());
    if (user.value.status === 'inactive') return err(USER_INACTIVE());
    if (user.value.status === 'suspended' && user.value.suspendedReason)
      return err(USER_SUSPENDED(user.value.suspendedReason));

    return this.issueTokens(user.value);
  }

  private async findUser(
    usernameOrEmail: string,
  ): Promise<Result<User, LoginError>> {
    const isEmail = usernameOrEmail.includes('@');

    const result = isEmail
      ? await this.userRepository.findByEmail(usernameOrEmail)
      : await this.userRepository.findByUsername(usernameOrEmail);

    // for security should be access denied rather user not found
    if (!result.ok) return err(ACCESS_DENIED());
    if (!result.value) return err(ACCESS_DENIED());

    return ok(result.value);
  }

  private issueTokens(user: User): LoginResult {
    const payload: LoginJwtPayload = { userId: user.id, role: user.role };
    return ok({
      accessToken: this.jwtLoginService.signAccessToken(payload),
      refreshToken: this.jwtLoginService.signRefreshToken(payload),
    });
  }
}
