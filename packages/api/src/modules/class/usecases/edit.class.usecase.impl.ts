import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import {
  Class,
  ClassNotFoundError,
  EditClassCommand,
  EditClassUseCase,
  err,
  IClassRepository,
  InfrastructureError,
  ok,
  Result,
} from '@pikslots/domain';
import type {
  AuditLogJobDataShape,
  SyncClassClassGroupsEvent,
  UnauthorizedError,
} from '@pikslots/domain';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { Queue } from 'bullmq';
import {
  AUDIT_LOG_QUEUE,
  PIKSLOT_EVENTS,
} from 'src/shared/queue/jobs/pikslot.events';
import type { AuditLogJobName } from 'src/shared/queue/jobs';

import type { ClassRepository } from '@pikslots/domain';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'Can not edit class : unauthorized!!!',
  timestamp: new Date(),
};

@Injectable()
export class EditClassUseCaseImpl implements EditClassUseCase {
  constructor(
    @Inject(IClassRepository)
    private readonly classRepository: ClassRepository,
    private readonly securityContext: SecurityContext,
    @InjectQueue(PIKSLOT_EVENTS.CLASS_GROUP_ASSIGNMENT.SYNC_CLASS_CLASS_GROUPS)
    private readonly classGroupAssignmentQueue: Queue<
      SyncClassClassGroupsEvent,
      void,
      typeof PIKSLOT_EVENTS.CLASS_GROUP_ASSIGNMENT.SYNC_CLASS_CLASS_GROUPS
    >,
    @InjectQueue(AUDIT_LOG_QUEUE)
    private readonly auditLogQueue: Queue<
      AuditLogJobDataShape,
      void,
      AuditLogJobName
    >,
  ) {}

  async execute(
    command: EditClassCommand,
  ): Promise<
    Result<void, ClassNotFoundError | UnauthorizedError | InfrastructureError>
  > {
    const callerRole = this.securityContext.role;
    const callerBusinessId = this.securityContext.businessId;
    const isPartOfSameBusiness = callerBusinessId === command.businessId;

    if (!Class.canEditClass(callerRole, isPartOfSameBusiness))
      return err(UNAUTHORIZED_ERROR);

    const found = await this.classRepository.findById(command.id);

    if (!found.ok) return err(found.error);

    if (!found.value) {
      return err({
        kind: 'class_not_found',
        message: `Class not found by id: ${command.id}`,
        timestamp: new Date(),
        by: 'id',
        value: command.id,
      } satisfies ClassNotFoundError);
    }

    const updated = found.value.update({
      title: command.title,
      description: command.description,
      imagesUrls: command.imagesUrls,
      durationInMins: command.durationInMins,
      seats: command.seats,
      cost: command.cost,
      isHiddenFromBookingPage: command.isHiddenFromBookingPage,
      updatedBy: command.updatedBy,
    });

    const saved = await this.classRepository.update(updated);

    if (!saved.ok) return err(saved.error);

    // Sync class group assignments (always fire so removals are processed)
    await this.classGroupAssignmentQueue.add(
      PIKSLOT_EVENTS.CLASS_GROUP_ASSIGNMENT.SYNC_CLASS_CLASS_GROUPS,
      {
        classId: command.id,
        classGroupIds: command.associatedClassGroupIds,
        businessId: command.businessId,
        assignedBy: command.updatedBy,
      },
    );

    await this.logClassUpdatedAudit(updated);

    return ok(undefined);
  }

  private async logClassUpdatedAudit(cls: Class): Promise<void> {
    const payload: AuditLogJobDataShape = {
      businessId: cls.businessId,
      userId: this.securityContext.userId,
      userType: 'user',
      action: PIKSLOT_EVENTS.AUDIT_LOG.CLASS_UPDATED,
      description: `Class '${cls.title}' was updated`,
      entityType: 'class',
      entityId: cls.id,
      occurredAt: new Date().toISOString(),
    };

    await this.auditLogQueue.add(
      PIKSLOT_EVENTS.AUDIT_LOG.CLASS_UPDATED,
      payload,
    );
  }
}
