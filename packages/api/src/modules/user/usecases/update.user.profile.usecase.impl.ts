import { InjectQueue } from '@nestjs/bullmq';
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
  AuditLogJobDataShape,
  UserNotFoundError,
  UpdateUserProfileCommand,
  UpdateUserProfileUseCase,
  UserRepository,
  UnauthorizedError,
} from '@pikslots/domain';
import { Queue } from 'bullmq';
import { SecurityContext } from 'src/shared/security/context/security.context';
import {
  AUDIT_LOG_QUEUE,
  PIKSLOT_EVENTS,
} from 'src/shared/queue/jobs/pikslot.events';
import type { AuditLogJobName } from 'src/shared/queue/jobs';

@Injectable()
export class UpdateUserProfileUseCaseImpl implements UpdateUserProfileUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: UserRepository,
    private readonly securityContext: SecurityContext,
    @InjectQueue(AUDIT_LOG_QUEUE)
    private readonly auditLogQueue: Queue<
      AuditLogJobDataShape,
      void,
      AuditLogJobName
    >,
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

    await this.logUserProfileUpdatedAudit(updated);

    return ok(updated);
  }

  private async logUserProfileUpdatedAudit(user: User): Promise<void> {
    const payload: AuditLogJobDataShape = {
      businessId: user.businessId,
      userId: this.securityContext.userId,
      userType: 'user',
      action: PIKSLOT_EVENTS.AUDIT_LOG.USER_PROFILE_UPDATED,
      description: `${user.name.firstName} ${user.name.lastName} (${user.email})'s profile was updated`,
      entityType: 'user',
      entityId: user.id,
      occurredAt: new Date().toISOString(),
    };

    await this.auditLogQueue.add(
      PIKSLOT_EVENTS.AUDIT_LOG.USER_PROFILE_UPDATED,
      payload,
    );
  }
}
