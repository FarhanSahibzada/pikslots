import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { IUserRepository, ok, err, UserNotFoundError } from '@pikslots/domain';
import { InviteJwtPayload } from '@pikslots/shared';
import { UserRepositoryTestImpl } from '../repository/user.repository.fake.impl';
import { RequestInviteOtpUseCaseImpl } from './request.invite.otp.usecase.impl';
import { OtpService } from 'src/shared/cache/otp/otp.service';
import { PikslotEmailService } from 'src/shared/email/pikslot.email.service';
import { JwtInviteService } from 'src/shared/security/jwt/jwt.invite.service';
import { AUDIT_LOG_QUEUE } from 'src/shared/queue/jobs/pikslot.events';

describe('RequestInviteOtpUseCaseImpl', () => {
  let useCase: RequestInviteOtpUseCaseImpl;
  let otpService: jest.Mocked<OtpService>;
  let jwtService: jest.Mocked<JwtInviteService>;
  let emailService: jest.Mocked<PikslotEmailService>;
  let repo: UserRepositoryTestImpl;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        RequestInviteOtpUseCaseImpl,
        { provide: IUserRepository, useClass: UserRepositoryTestImpl },
        { provide: OtpService, useValue: { generate: jest.fn() } },
        { provide: PikslotEmailService, useValue: { sendEmail: jest.fn() } },
        {
          provide: JwtInviteService,
          useValue: { verifyInviteToken: jest.fn() },
        },
        {
          provide: getQueueToken(AUDIT_LOG_QUEUE),
          useValue: { add: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    useCase = moduleRef.get(RequestInviteOtpUseCaseImpl);
    otpService = moduleRef.get(OtpService);
    jwtService = moduleRef.get(JwtInviteService);
    emailService = moduleRef.get(PikslotEmailService);
    repo = moduleRef.get(IUserRepository);
  });

  it('returns success when token valid and user invited', async () => {
    jwtService.verifyInviteToken.mockReturnValue(
      ok<InviteJwtPayload>({
        userId: 'user-standard-1',
        businessId: 'business-1',
      }),
    );
    otpService.generate.mockResolvedValue('123456');
    (emailService.sendEmail as jest.Mock).mockResolvedValue({ ok: true });
    const result = await useCase.execute({ token: 'tok' });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.message).toBe('success');
  });

  it('returns unauthorized when token invalid', async () => {
    jwtService.verifyInviteToken.mockReturnValue(
      err({
        kind: 'unauthorized',
        message: 'Invalid invite token',
        timestamp: new Date(),
      }),
    );

    const result = await useCase.execute({ token: 'bad' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('unauthorized');
      expect(result.error.message).toBeDefined();
    }
  });

  it('returns user_not_found when user missing', async () => {
    jwtService.verifyInviteToken.mockReturnValue(
      ok<InviteJwtPayload>({
        userId: 'non-existent',
        businessId: 'business-1',
      }),
    );

    const result = await useCase.execute({ token: 'tok' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('user_not_found');
      expect(result.error.message).toBeDefined();
      expect((result.error as UserNotFoundError).by).toBe('id');
      expect((result.error as UserNotFoundError).value).toBe('non-existent');
    }
  });

  it('returns invite_already_accepted when user already accepted', async () => {
    jwtService.verifyInviteToken.mockReturnValue(
      ok<InviteJwtPayload>({
        userId: 'user-standard-1',
        businessId: 'business-1',
      }),
    );
    // activate user
    const find = await repo.findById('user-standard-1');
    if (!find.ok || !find.value) throw new Error('user not found in fixture');
    const accepted = find.value.acceptInvite('pw', 'test');
    await repo.update(accepted);

    const result = await useCase.execute({ token: 'tok' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('invite_already_accepted');
      expect(result.error.message).toBeDefined();
    }
  });
});
