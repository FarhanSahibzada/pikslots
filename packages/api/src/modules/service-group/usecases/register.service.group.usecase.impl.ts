import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  InfrastructureError,
  IServiceGroupRepository,
  ok,
  Result,
  ServiceGroup,
  ServiceGroupAlreadyExistsInBusinessError,
} from '@pikslots/domain';
import type {
  SyncServiceGroupServicesEvent,
  RegisterServiceGroupCommand,
  RegisterServiceGroupUseCase,
  ServiceGroupRepository,
} from '@pikslots/domain';
import { Queue } from 'bullmq';
import { PIKSLOT_EVENTS } from 'src/shared/queue/jobs/pikslot.events';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class RegisterServiceGroupUseCaseImpl implements RegisterServiceGroupUseCase {
  constructor(
    @Inject(IServiceGroupRepository)
    private readonly serviceGroupRepository: ServiceGroupRepository,
    @InjectQueue(
      PIKSLOT_EVENTS.SERVICE_GROUP_ASSIGNMENT.SYNC_SERVICE_GROUP_SERVICES,
    )
    private readonly serviceGroupAssignmentQueue: Queue<
      SyncServiceGroupServicesEvent,
      void,
      typeof PIKSLOT_EVENTS.SERVICE_GROUP_ASSIGNMENT.SYNC_SERVICE_GROUP_SERVICES
    >,
  ) {}

  async execute(
    command: RegisterServiceGroupCommand,
  ): Promise<
    Result<
      { message: 'success' },
      ServiceGroupAlreadyExistsInBusinessError | InfrastructureError
    >
  > {
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

    const group = ServiceGroup.create({
      id: uuidv7(),
      name: command.name,
      businessId: command.businessId,
      createdBy: command.createdBy,
    });

    const saved = await this.serviceGroupRepository.save(group);
    if (!saved.ok) return err(saved.error);

    if (command.associatedServices.length > 0) {
      // TODO fire event
      // (single) service group --> assing to --> services(multiple)
      await this.serviceGroupAssignmentQueue.add(
        PIKSLOT_EVENTS.SERVICE_GROUP_ASSIGNMENT.SYNC_SERVICE_GROUP_SERVICES,
        {
          serviceGroupId: group.id,
          serviceIds: command.associatedServices,
          businessId: command.businessId,
          assignedBy: command.createdBy,
        },
      );
    }
    return ok({ message: 'success' });
  }
}
