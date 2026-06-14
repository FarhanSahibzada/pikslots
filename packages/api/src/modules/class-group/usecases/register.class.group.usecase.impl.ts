import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import {
  ClassGroup,
  ClassGroupAlreadyExistsInBusinessError,
  err,
  IClassGroupRepository,
  InfrastructureError,
  ok,
  Result,
} from '@pikslots/domain';
import type {
  SyncClassGroupClassesEvent,
  RegisterClassGroupCommand,
  RegisterClassGroupUseCase,
  ClassGroupRepository,
} from '@pikslots/domain';
import { Queue } from 'bullmq';
import { PIKSLOT_EVENTS } from 'src/shared/queue/jobs/pikslot.events';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class RegisterClassGroupUseCaseImpl implements RegisterClassGroupUseCase {
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
    command: RegisterClassGroupCommand,
  ): Promise<
    Result<
      { message: 'success' },
      ClassGroupAlreadyExistsInBusinessError | InfrastructureError
    >
  > {
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

    const group = ClassGroup.create({
      id: uuidv7(),
      name: command.name,
      businessId: command.businessId,
      createdBy: command.createdBy,
    });

    const saved = await this.classGroupRepository.save(group);
    if (!saved.ok) return err(saved.error);

    if (command.associatedClasses.length > 0) {
      // (single) class group --> assign to --> classes (multiple)
      await this.classGroupAssignmentQueue.add(
        PIKSLOT_EVENTS.CLASS_GROUP_ASSIGNMENT.SYNC_CLASS_GROUP_CLASSES,
        {
          classGroupId: group.id,
          classIds: command.associatedClasses,
          businessId: command.businessId,
          assignedBy: command.createdBy,
        },
      );
    }

    return ok({ message: 'success' });
  }
}
