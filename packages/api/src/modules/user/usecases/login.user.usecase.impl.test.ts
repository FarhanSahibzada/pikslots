import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { IUserRepository } from '@pikslots/domain';
import { UserRepositoryTestImpl } from '../repository/user.repository.fake.impl';
import { LoginUserUseCaseImpl } from './login.user.usecase.impl';
import { JwtLoginService } from 'src/shared/security/jwt/jwt.login.service';
import { PasswordHashingService } from 'src/shared/security/hashing/password.hashing.service';
import { PIKSLOT_EVENTS } from 'src/shared/queue/jobs/pikslot.events';

describe('LoginUserUseCaseImpl', () => {
  let useCase: LoginUserUseCaseImpl;
  let hash: jest.Mocked<PasswordHashingService>;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUserUseCaseImpl,
        { provide: IUserRepository, useClass: UserRepositoryTestImpl },
        {
          provide: JwtLoginService,
          useValue: {
            signAccessToken: jest.fn().mockReturnValue('a'),
            signRefreshToken: jest.fn().mockReturnValue('r'),
          },
        },
        { provide: PasswordHashingService, useValue: { compare: jest.fn() } },
        {
          provide: getQueueToken(PIKSLOT_EVENTS.AUDIT_LOG.USER_LOGIN),
          useValue: { add: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    useCase = moduleRef.get(LoginUserUseCaseImpl);
    hash = moduleRef.get(PasswordHashingService);
  });

  it('returns tokens when credentials are valid (by username)', async () => {
    (hash.compare as jest.Mock).mockResolvedValue(true);

    const result = await useCase.execute({
      usernameOrEmail: 'admin_user_2',
      password: 'pw',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.accessToken).toBe('a');
      expect(result.value.refreshToken).toBe('r');
    }
  });

  it('returns unauthorized when password mismatch', async () => {
    (hash.compare as jest.Mock).mockResolvedValue(false);

    const result = await useCase.execute({
      usernameOrEmail: 'admin_user',
      password: 'bad',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('unauthorized');
    if (!result.ok) {
      expect(result.error.kind).toBe('unauthorized');
      expect(result.error.message).toBeDefined();
    }
  });

  it('returns user_no_access when user role is No Access', async () => {
    (hash.compare as jest.Mock).mockResolvedValue(true);

    const result = await useCase.execute({
      usernameOrEmail: 'no_access_user',
      password: 'pw',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('user_no_access');
    if (!result.ok) {
      expect(result.error.kind).toBe('user_no_access');
      expect(result.error.message).toBeDefined();
    }
  });

  it('returns user_inactive when user is inactive', async () => {
    (hash.compare as jest.Mock).mockResolvedValue(true);

    const result = await useCase.execute({
      usernameOrEmail: 'inactive_user',
      password: 'pw',
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.kind).toBe('user_inactive');
    }
  });

  it('returns user_suspended when user is suspended', async () => {
    (hash.compare as jest.Mock).mockResolvedValue(true);

    const result = await useCase.execute({
      usernameOrEmail: 'suspended_user',
      password: 'pw',
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.kind).toBe('user_suspended');
    }
  });

  it('returns user_invited_error when user is invited', async () => {
    (hash.compare as jest.Mock).mockResolvedValue(true);

    const result = await useCase.execute({
      usernameOrEmail: 'invited_user',
      password: 'pw',
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.kind).toBe('user_invited');
    }
  });
});
