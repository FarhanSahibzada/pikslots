import { InjectQueue } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import {
  err,
  InfrastructureError,
  ITimeoffRepository,
  ok,
  Result,
  RegisterTimeOffUseCase,
  Timeoff,
  UnauthorizedError,
  CreateTimeoffCommand,
} from '@pikslots/domain';
import type { AuditLogJobDataShape, TimeOffRepository } from '@pikslots/domain';
import { Queue } from 'bullmq';
import { SecurityContext } from 'src/shared/security/context/security.context';
import {
  AUDIT_LOG_QUEUE,
  PIKSLOT_EVENTS,
} from 'src/shared/queue/jobs/pikslot.events';
import type { AuditLogJobName } from 'src/shared/queue/jobs';
import { v7 as uuidv7 } from 'uuid';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'Can not create timeoff : unauthorized!!!',
  timestamp: new Date(),
};
export class RegisterTimeOffUseCaseImpl implements RegisterTimeOffUseCase {
  constructor(
    @Inject(ITimeoffRepository)
    private readonly timeoffRepository: TimeOffRepository,
    private readonly securityContext: SecurityContext,
    @InjectQueue(AUDIT_LOG_QUEUE)
    private readonly auditLogQueue: Queue<
      AuditLogJobDataShape,
      void,
      AuditLogJobName
    >,
  ) {}
  async execute(
    command: CreateTimeoffCommand,
  ): Promise<Result<Timeoff, UnauthorizedError | InfrastructureError>> {
    const callerRole = this.securityContext.role;
    const isSelf = this.securityContext.userId === command.userId;
    const isPartOfTheSameBusiness =
      this.securityContext.businessId === command.businessId;

    if (!Timeoff.canCreateTimeoff(callerRole, isPartOfTheSameBusiness, isSelf))
      return err(UNAUTHORIZED_ERROR);

    const timeoff = Timeoff.create({
      id: uuidv7(),
      title: command.title,
      userId: command.userId,
      businessId: command.businessId,
      startDateTime: command.startDateTime,
      endDateTime: command.endDateTime,
      timeZone: command.timeZone,
      allDay: command.allDay,
      recurrence: command.recurrence,
      createdBy: command.userId,
      updatedBy: command.userId,
    });

    const saved = await this.timeoffRepository.save(timeoff);

    if (!saved.ok) return err(saved.error);

    await this.logTimeoffCreatedAudit(timeoff);

    return ok(timeoff);
  }

  private async logTimeoffCreatedAudit(timeoff: Timeoff): Promise<void> {
    const payload: AuditLogJobDataShape = {
      businessId: timeoff.businessId,
      userId: this.securityContext.userId,
      userType: 'user',
      action: PIKSLOT_EVENTS.AUDIT_LOG.TIMEOFF_CREATED,
      description: `Timeoff '${timeoff.title}' was created`,
      entityType: 'timeoff',
      entityId: timeoff.id,
      occurredAt: new Date().toISOString(),
    };

    await this.auditLogQueue.add(
      PIKSLOT_EVENTS.AUDIT_LOG.TIMEOFF_CREATED,
      payload,
    );
  }
}
