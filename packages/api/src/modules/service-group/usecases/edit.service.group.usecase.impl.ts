import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  ok,
  InfrastructureError,
  IServiceGroupRepository,
  Result,
  ServiceGroupAlreadyExistsInBusinessError,
  ServiceGroupNotFoundError,
} from '@pikslots/domain';
import type {
  SyncServiceGroupServicesEvent,
  EditServiceGroupCommand,
  EditServiceGroupUseCase,
  ServiceGroupRepository,
} from '@pikslots/domain';
import { Queue } from 'bullmq';
import { PIKSLOT_EVENTS } from 'src/shared/queue/jobs/pikslot.events';

@Injectable()
export class EditServiceGroupUseCaseImpl implements EditServiceGroupUseCase {
  constructor(
    @Inject(IServiceGroupRepository)
    private readonly serviceGroupRepository: ServiceGroupRepository,
    @InjectQueue(PIKSLOT_EVENTS.SERVICE_GROUP_ASSIGNMENT.SYNC_SERVICE_GROUP_SERVICES)
    private readonly serviceGroupAssignmentQueue: Queue<
      SyncServiceGroupServicesEvent,
      void,
      typeof PIKSLOT_EVENTS.SERVICE_GROUP_ASSIGNMENT.SYNC_SERVICE_GROUP_SERVICES
    >,
  ) {}

  async execute(
    command: EditServiceGroupCommand,
  ): Promise<
    Result<
      void,
      ServiceGroupNotFoundError | ServiceGroupAlreadyExistsInBusinessError | InfrastructureError
    >
  > {
    // 1. Load existing group
    const found = await this.serviceGroupRepository.findById(command.serviceGroupId);
    if (!found.ok) return err(found.error);
    if (!found.value) {
      return err<ServiceGroupNotFoundError>({
        kind: 'service_group_not_found',
        by: 'id',
        value: command.serviceGroupId,
        message: `Service group not found against ${command.serviceGroupId}`,
        timestamp: new Date(),
      });
    }

    // 2. Rename if name changed — check uniqueness first
    let group = found.value;
    if (group.name !== command.name) {
      const nameExists = await this.serviceGroupRepository.existsByName(
        command.name,
        command.businessId,
      );
      if (!nameExists.ok) return err(nameExists.error);
      if (nameExists.value) {
        return err<ServiceGroupAlreadyExistsInBusinessError>({
          kind: 'service_group_already_exists',
          name: command.name,
          businessId: command.businessId,
          message: `A service group named '${command.name}' already exists for this business`,
          timestamp: new Date(),
        });
      }
      group = group.rename(command.name, command.updatedBy);
      const updated = await this.serviceGroupRepository.update(group);
      if (!updated.ok) return err(updated.error);
    }

    // 3. Fire event to sync service assignments (always fire so removals are processed)
    await this.serviceGroupAssignmentQueue.add(
      PIKSLOT_EVENTS.SERVICE_GROUP_ASSIGNMENT.SYNC_SERVICE_GROUP_SERVICES,
      {
        serviceGroupId: command.serviceGroupId,
        serviceIds: command.serviceIds,
        businessId: command.businessId,
        assignedBy: command.updatedBy,
      },
    );

    return ok(undefined);
  }
}
