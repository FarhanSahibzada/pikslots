import { InjectQueue } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import {
  DeleteTimeoffUseCase,
  err,
  InfrastructureError,
  ITimeoffRepository,
  ok,
  Result,
  Timeoff,
  TimeOffNotFound,
  UnauthorizedError,
} from '@pikslots/domain';
import type { AuditLogJobDataShape, TimeOffRepository } from '@pikslots/domain';
import { Queue } from 'bullmq';
import { SecurityContext } from 'src/shared/security/context/security.context';
import {
  AUDIT_LOG_QUEUE,
  PIKSLOT_EVENTS,
} from 'src/shared/queue/jobs/pikslot.events';
import type { AuditLogJobName } from 'src/shared/queue/jobs';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'Can not delete timeoff : unauthorized!!!',
  timestamp: new Date(),
};
export class DeleteTimeoffUseCaseImpl implements DeleteTimeoffUseCase {
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
    id: string,
  ): Promise<
    Result<void, TimeOffNotFound | UnauthorizedError | InfrastructureError>
  > {
    const found = await this.timeoffRepository.findById(id);

    if (!found.ok) return err(found.error);

    if (!found.value) {
      return err({
        kind: 'timeoff_not_found',
        message: `timeoff not found by id: ${id}`,
        timestamp: new Date(),
        by: 'id',
        value: id,
      });
    }

    const callerRole = this.securityContext.role;
    const isSelf = this.securityContext.userId === found.value.userId;
    const isPartOfSameBusiness =
      this.securityContext.businessId === found.value.businessId;

    if (!Timeoff.canDeleteTimeoff(callerRole, isPartOfSameBusiness, isSelf))
      return err(UNAUTHORIZED_ERROR);

    const deleteTimeoff = await this.timeoffRepository.delete(found.value.id);

    if (!deleteTimeoff.ok) return err(deleteTimeoff.error);

    await this.logTimeoffDeletedAudit(found.value);

    return ok(deleteTimeoff.value);
  }

  private async logTimeoffDeletedAudit(timeoff: Timeoff): Promise<void> {
    const payload: AuditLogJobDataShape = {
      businessId: timeoff.businessId,
      userId: this.securityContext.userId,
      userType: 'user',
      action: PIKSLOT_EVENTS.AUDIT_LOG.TIMEOFF_DELETED,
      description: `Timeoff '${timeoff.title}' was deleted`,
      entityType: 'timeoff',
      entityId: timeoff.id,
      occurredAt: new Date().toISOString(),
    };

    await this.auditLogQueue.add(
      PIKSLOT_EVENTS.AUDIT_LOG.TIMEOFF_DELETED,
      payload,
    );
  }
}
