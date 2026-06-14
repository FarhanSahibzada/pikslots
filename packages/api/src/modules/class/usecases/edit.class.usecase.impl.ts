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
import type { SyncClassClassGroupsEvent, UnauthorizedError } from '@pikslots/domain';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { Queue } from 'bullmq';
import { PIKSLOT_EVENTS } from 'src/shared/queue/jobs/pikslot.events';

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

    return ok(undefined);
  }
}
