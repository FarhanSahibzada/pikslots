import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  ok,
  InfrastructureError,
  IServiceUserAssignmentRepository,
  Result,
  ServiceUserAssignment,
  ServiceUserAssignmentNotFoundError,
  RemoveUserFromServiceCommand,
  RemoveUserFromServiceUseCase,
} from '@pikslots/domain';
import type {
  AuditLogJobDataShape,
  ServiceUserAssignmentRepository,
} from '@pikslots/domain';
import { Queue } from 'bullmq';
import {
  AUDIT_LOG_QUEUE,
  PIKSLOT_EVENTS,
} from 'src/shared/queue/jobs/pikslot.events';
import type { AuditLogJobName } from 'src/shared/queue/jobs';

@Injectable()
export class RemoveUserFromServiceUseCaseImpl implements RemoveUserFromServiceUseCase {
  constructor(
    @Inject(IServiceUserAssignmentRepository)
    private readonly assignmentRepository: ServiceUserAssignmentRepository,
    @InjectQueue(AUDIT_LOG_QUEUE)
    private readonly auditLogQueue: Queue<
      AuditLogJobDataShape,
      void,
      AuditLogJobName
    >,
  ) {}

  async execute(
    command: RemoveUserFromServiceCommand,
  ): Promise<
    Result<void, ServiceUserAssignmentNotFoundError | InfrastructureError>
  > {
    const found = await this.assignmentRepository.findByServiceAndUser(
      command.serviceId,
      command.userId,
    );

    if (!found.ok) return err(found.error);

    if (!found.value) {
      return err<ServiceUserAssignmentNotFoundError>({
        kind: 'service_user_assignment_not_found',
        serviceId: command.serviceId,
        userId: command.userId,
        message: `User '${command.userId}' is not assigned to service '${command.serviceId}'`,
        timestamp: new Date(),
      });
    }

    const softDeleted = found.value.softDelete(command.deletedBy);

    const updated = await this.assignmentRepository.update(softDeleted);
    if (!updated.ok) return err(updated.error);

    await this.logServiceUserUnassignedAudit(softDeleted);

    return ok(undefined);
  }

  private async logServiceUserUnassignedAudit(
    assignment: ServiceUserAssignment,
  ): Promise<void> {
    const payload: AuditLogJobDataShape = {
      businessId: assignment.businessId,
      userId: assignment.deletedBy ?? assignment.createdBy,
      userType: 'user',
      action: PIKSLOT_EVENTS.AUDIT_LOG.SERVICE_USER_UNASSIGNED,
      description: `User '${assignment.userId}' was removed from service '${assignment.serviceId}'`,
      entityType: 'service_user_assignment',
      entityId: assignment.id,
      occurredAt: new Date().toISOString(),
    };

    await this.auditLogQueue.add(
      PIKSLOT_EVENTS.AUDIT_LOG.SERVICE_USER_UNASSIGNED,
      payload,
    );
  }
}
