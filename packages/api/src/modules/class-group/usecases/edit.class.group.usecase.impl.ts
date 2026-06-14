import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import {
  ClassGroupAlreadyExistsInBusinessError,
  ClassGroupNotFoundError,
  err,
  IClassGroupRepository,
  InfrastructureError,
  ok,
  Result,
} from '@pikslots/domain';
import type {
  SyncClassGroupClassesEvent,
  EditClassGroupCommand,
  EditClassGroupUseCase,
  ClassGroupRepository,
} from '@pikslots/domain';
import { Queue } from 'bullmq';
import { PIKSLOT_EVENTS } from 'src/shared/queue/jobs/pikslot.events';

@Injectable()
export class EditClassGroupUseCaseImpl implements EditClassGroupUseCase {
  constructor(
    @Inject(IClassGroupRepository)
    private readonly classGroupRepository: ClassGroupRepository,
    @InjectQueue(PIKSLOT_EVENTS.CLASS_GROUP_ASSIGNMENT.SYNC_CLASS_GROUP_CLASSES)
    private readonly classGroupAssignmentQueue: Queue<
      SyncClassGroupClassesEvent,
      void,
      typeof PIKSLOT_EVENTS.CLASS_GROUP_ASSIGNMENT.SYNC_CLASS_GROUP_CLASSES
    >,
  ) {}

  async execute(
    command: EditClassGroupCommand,
  ): Promise<
    Result<
      void,
      | ClassGroupNotFoundError
      | ClassGroupAlreadyExistsInBusinessError
      | InfrastructureError
    >
  > {
    // 1. Load existing group
    const found = await this.classGroupRepository.findById(
      command.classGroupId,
    );
    if (!found.ok) return err(found.error);
    if (!found.value) {
      return err<ClassGroupNotFoundError>({
        kind: 'class_group_not_found',
        by: 'id',
        value: command.classGroupId,
        message: `Class group not found against ${command.classGroupId}`,
        timestamp: new Date(),
      });
    }

    // 2. Rename if name changed — check uniqueness first
    let group = found.value;
    if (group.name !== command.name) {
      const nameExists = await this.classGroupRepository.existsByName(
        command.name,
        command.businessId,
      );
      if (!nameExists.ok) return err(nameExists.error);
      if (nameExists.value) {
        return err<ClassGroupAlreadyExistsInBusinessError>({
          kind: 'class_group_already_exists',
          name: command.name,
          businessId: command.businessId,
          message: `A class group named '${command.name}' already exists for this business`,
          timestamp: new Date(),
        });
      }
      group = group.rename(command.name, command.updatedBy);
      const updated = await this.classGroupRepository.update(group);
      if (!updated.ok) return err(updated.error);
    }

    // 3. Fire event to sync class assignments (always fire so removals are processed)
    await this.classGroupAssignmentQueue.add(
      PIKSLOT_EVENTS.CLASS_GROUP_ASSIGNMENT.SYNC_CLASS_GROUP_CLASSES,
      {
        classGroupId: command.classGroupId,
        classIds: command.classIds,
        businessId: command.businessId,
        assignedBy: command.updatedBy,
      },
    );

    return ok(undefined);
  }
}
