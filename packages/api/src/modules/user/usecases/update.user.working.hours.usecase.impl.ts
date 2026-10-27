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
  WorkingHoursUpdateNotAuthorizedError,
  UpdateUserWorkingHoursCommand,
  UpdateUserWorkingHoursUseCase,
  UserRepository,
} from '@pikslots/domain';
import { Queue } from 'bullmq';
import { SecurityContext } from 'src/shared/security/context/security.context';
import {
  AUDIT_LOG_QUEUE,
  PIKSLOT_EVENTS,
} from 'src/shared/queue/jobs/pikslot.events';
import type { AuditLogJobName } from 'src/shared/queue/jobs';

@Injectable()
export class UpdateUserWorkingHoursUseCaseImpl implements UpdateUserWorkingHoursUseCase {
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
    command: UpdateUserWorkingHoursCommand,
  ): Promise<
    Result<
      User,
      | UserNotFoundError
      | WorkingHoursUpdateNotAuthorizedError
      | InfrastructureError
    >
  > {
    const callerId = this.securityContext.userId;
    const callerRole = this.securityContext.role;
    const callerBusinessId = this.securityContext.businessId;

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

    const isSelf = callerId === command.userId;
    const isPartofSameBusiness = callerBusinessId === target.businessId;

    if (!User.canUpdateWorkingHours(callerRole, isSelf, isPartofSameBusiness)) {
      return err<WorkingHoursUpdateNotAuthorizedError>({
        kind: 'working_hours_update_not_authorized',
        updaterRole: callerRole,
        targetRole: target.role,
        message: `Role '${callerRole}' is not allowed to update working hours for role '${target.role}'`,
        timestamp: new Date(),
      });
    }

    const updated = target.updateWorkingHours({
      userWorkingHours: command.userWorkingHours,
      updatedBy: callerId,
    });

    const updateResult = await this.userRepository.update(updated);
    if (!updateResult.ok) return err(updateResult.error);

    await this.logWorkingHoursUpdatedAudit(updated);

    return ok(updated);
  }

  private async logWorkingHoursUpdatedAudit(user: User): Promise<void> {
    const payload: AuditLogJobDataShape = {
      businessId: user.businessId,
      userId: this.securityContext.userId,
      userType: 'user',
      action: PIKSLOT_EVENTS.AUDIT_LOG.USER_WORKING_HOURS_UPDATED,
      description: `${user.name.firstName} ${user.name.lastName}'s working hours were updated`,
      entityType: 'user',
      entityId: user.id,
      occurredAt: new Date().toISOString(),
    };

    await this.auditLogQueue.add(
      PIKSLOT_EVENTS.AUDIT_LOG.USER_WORKING_HOURS_UPDATED,
      payload,
    );
  }
}
