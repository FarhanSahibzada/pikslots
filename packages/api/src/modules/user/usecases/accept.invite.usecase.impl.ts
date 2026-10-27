import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import {
  IUserRepository,
  InfrastructureError,
  Result,
  err,
  ok,
  User,
} from '@pikslots/domain';
import type {
  AcceptInviteCommand,
  AcceptInviteUseCase,
  AuditLogJobDataShape,
  InviteAlreadyAcceptedError,
  InvalidOtpError,
  UserNotFoundError,
  UserRepository,
} from '@pikslots/domain';
import { Queue } from 'bullmq';
import { OtpService } from 'src/shared/cache/otp/otp.service';
import { PasswordHashingService } from 'src/shared/security/hashing/password.hashing.service';
import {
  AUDIT_LOG_QUEUE,
  PIKSLOT_EVENTS,
} from 'src/shared/queue/jobs/pikslot.events';
import type { AuditLogJobName } from 'src/shared/queue/jobs';

@Injectable()
export class AcceptInviteUseCaseImpl implements AcceptInviteUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: UserRepository,
    private readonly otpService: OtpService,
    private readonly passwordHashingService: PasswordHashingService,
    @InjectQueue(AUDIT_LOG_QUEUE)
    private readonly auditLogQueue: Queue<
      AuditLogJobDataShape,
      void,
      AuditLogJobName
    >,
  ) {}

  async execute(
    command: AcceptInviteCommand,
  ): Promise<
    Result<
      { message: 'success' },
      | UserNotFoundError
      | InviteAlreadyAcceptedError
      | InvalidOtpError
      | InfrastructureError
    >
  > {
    const findResult = await this.userRepository.findById(command.userId);

    if (!findResult.ok) return err(findResult.error as InfrastructureError);

    const user = findResult.value;
    if (!user) {
      return err<UserNotFoundError>({
        kind: 'user_not_found',
        by: 'id',
        value: command.userId,
        message: `User not found: ${command.userId}`,
        timestamp: new Date(),
      });
    }

    if (user.status !== 'invited') {
      return err<InviteAlreadyAcceptedError>({
        kind: 'invite_already_accepted',
        status: user.status,
        message: 'This invite has already been accepted.',
        timestamp: new Date(),
      });
    }

    const otpValid = await this.otpService.verify(
      `invite:otp:${command.userId}`,
      command.otp,
    );

    if (!otpValid) {
      return err<InvalidOtpError>({
        kind: 'invalid_otp',
        message: 'The code you entered is incorrect or has expired.',
        timestamp: new Date(),
      });
    }

    const hashedPassword = await this.passwordHashingService.hash(
      command.newPassword,
    );

    const activated = user.acceptInvite(hashedPassword, command.userId);

    const updateResult = await this.userRepository.update(activated);

    if (!updateResult.ok) return err(updateResult.error);

    await this.logInviteAcceptedAudit(activated);

    return ok({ message: 'success' });
  }

  private async logInviteAcceptedAudit(user: User): Promise<void> {
    const payload: AuditLogJobDataShape = {
      businessId: user.businessId,
      userId: user.id,
      userType: 'user',
      action: PIKSLOT_EVENTS.AUDIT_LOG.USER_INVITE_ACCEPTED,
      description: `${user.name.firstName} ${user.name.lastName} (${user.email}) accepted their invite`,
      entityType: 'user',
      entityId: user.id,
      occurredAt: new Date().toISOString(),
    };

    await this.auditLogQueue.add(
      PIKSLOT_EVENTS.AUDIT_LOG.USER_INVITE_ACCEPTED,
      payload,
    );
  }
}
