import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { IUserRepository } from '@pikslots/domain';
import { UserRepositoryTestImpl } from '../repository/user.repository.fake.impl';
import { AcceptInviteUseCaseImpl } from './accept.invite.usecase.impl';
import { OtpService } from 'src/shared/cache/otp/otp.service';
import { PasswordHashingService } from 'src/shared/security/hashing/password.hashing.service';
import { AUDIT_LOG_QUEUE } from 'src/shared/queue/jobs/pikslot.events';

describe('AcceptInviteUseCaseImpl', () => {
  let useCase: AcceptInviteUseCaseImpl;
  let otpService: jest.Mocked<OtpService>;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AcceptInviteUseCaseImpl,
        PasswordHashingService,
        { provide: IUserRepository, useClass: UserRepositoryTestImpl },
        {
          provide: OtpService,
          useValue: { verify: jest.fn() },
        },
        {
          provide: getQueueToken(AUDIT_LOG_QUEUE),
          useValue: { add: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    useCase = moduleRef.get(AcceptInviteUseCaseImpl);
    otpService = moduleRef.get(OtpService);
  });

  it('returns success when OTP is valid and user is in invited status', async () => {
    otpService.verify.mockResolvedValue(true);

    const result = await useCase.execute({
      userId: 'user-standard-1',
      businessId: 'business-1',
      otp: '123456',
      newPassword: 'NewPassword123!',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.message).toBe('success');
    }
  });

  it('returns user_not_found when the userId does not exist', async () => {
    const result = await useCase.execute({
      userId: 'non-existent-id',
      businessId: 'business-1',
      otp: '123456',
      newPassword: 'NewPassword123!',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('user_not_found');
    }
  });

  it('returns invite_already_accepted when user status is active', async () => {
    // First accept the invite to transition to active
    otpService.verify.mockResolvedValue(true);

    await useCase.execute({
      userId: 'user-enhanced-1',
      businessId: 'business-1',
      otp: '123456',
      newPassword: 'NewPassword123!',
    });

    // Try to accept again — user is now active
    const result = await useCase.execute({
      userId: 'user-enhanced-1',
      businessId: 'business-1',
      otp: '123456',
      newPassword: 'AnotherPassword123!',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('invite_already_accepted');
    }
  });

  it('returns invalid_otp when OTP does not match', async () => {
    otpService.verify.mockResolvedValue(false);

    const result = await useCase.execute({
      userId: 'user-admin-1',
      businessId: 'business-1',
      otp: '000000',
      newPassword: 'NewPassword123!',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('invalid_otp');
    }
  });

  it('calls otpService.verify with the correct cache key', async () => {
    otpService.verify.mockResolvedValue(false);

    await useCase.execute({
      userId: 'user-no-access-1',
      businessId: 'business-1',
      otp: '654321',
      newPassword: 'NewPassword123!',
    });

    expect(otpService.verify).toHaveBeenCalledWith(
      'invite:otp:user-no-access-1',
      '654321',
    );
  });
});
