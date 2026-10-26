import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  ok,
  InfrastructureError,
  IServiceUserAssignmentRepository,
  Result,
  ServiceUserAssignment,
  ServiceUserAssignmentAlreadyExistsError,
  AssignUserToServiceCommand,
  AssignUserToServiceUseCase,
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
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class AssignUserToServiceUseCaseImpl implements AssignUserToServiceUseCase {
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
    command: AssignUserToServiceCommand,
  ): Promise<
    Result<
      ServiceUserAssignment,
      ServiceUserAssignmentAlreadyExistsError | InfrastructureError
    >
  > {
    const exists = await this.assignmentRepository.existsByServiceAndUser(
      command.serviceId,
      command.userId,
    );

    if (!exists.ok) return err(exists.error);

    if (exists.value) {
      return err<ServiceUserAssignmentAlreadyExistsError>({
        kind: 'service_user_assignment_already_exists',
        serviceId: command.serviceId,
        userId: command.userId,
        message: `User '${command.userId}' is already assigned to service '${command.serviceId}'`,
        timestamp: new Date(),
      });
    }

    const assignment = ServiceUserAssignment.create({
      id: uuidv7(),
      serviceId: command.serviceId,
      userId: command.userId,
      businessId: command.businessId,
      createdBy: command.createdBy,
    });

    const saved = await this.assignmentRepository.save(assignment);

    if (!saved.ok) return err(saved.error);

    await this.logServiceUserAssignedAudit(assignment);

    return ok(assignment);
  }

  private async logServiceUserAssignedAudit(
    assignment: ServiceUserAssignment,
  ): Promise<void> {
    const payload: AuditLogJobDataShape = {
      businessId: assignment.businessId,
      userId: assignment.createdBy,
      userType: 'user',
      action: PIKSLOT_EVENTS.AUDIT_LOG.SERVICE_USER_ASSIGNED,
      description: `User '${assignment.userId}' was assigned to service '${assignment.serviceId}'`,
      entityType: 'service_user_assignment',
      entityId: assignment.id,
      occurredAt: new Date().toISOString(),
    };

    await this.auditLogQueue.add(
      PIKSLOT_EVENTS.AUDIT_LOG.SERVICE_USER_ASSIGNED,
      payload,
    );
  }
}
