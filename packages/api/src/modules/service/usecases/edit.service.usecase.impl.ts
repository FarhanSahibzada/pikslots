import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  InfrastructureError,
  IServiceRepository,
  ok,
  EditServiceCommand,
  EditServiceUseCase,
  Result,
  Service,
} from '@pikslots/domain';
import type {
  SyncServiceServiceGroupsEvent,
  SyncServiceToUsersEvent,
  ServiceRepository,
  ServiceNotFoundError,
  UnauthorizedError,
} from '@pikslots/domain';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PIKSLOT_EVENTS } from 'src/shared/queue/jobs/pikslot.events';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'Can not edit service : unauthorized!!!',
  timestamp: new Date(),
};

@Injectable()
export class EditServiceUseCaseImpl implements EditServiceUseCase {
  constructor(
    @Inject(IServiceRepository)
    private readonly serviceRepository: ServiceRepository,
    private readonly securityContext: SecurityContext,
    @InjectQueue(
      PIKSLOT_EVENTS.SERVICE_GROUP_ASSIGNMENT.SYNC_SERVICE_SERVICE_GROUPS,
    )
    private readonly serviceGroupAssignmentQueue: Queue<
      SyncServiceServiceGroupsEvent,
      void,
      typeof PIKSLOT_EVENTS.SERVICE_GROUP_ASSIGNMENT.SYNC_SERVICE_SERVICE_GROUPS
    >,
    @InjectQueue(PIKSLOT_EVENTS.SERVICE_USER_ASSIGNMENT.SYNC_SERVICE_TO_USERS)
    private readonly serviceUserAssignmentQueue: Queue<
      SyncServiceToUsersEvent,
      void,
      typeof PIKSLOT_EVENTS.SERVICE_USER_ASSIGNMENT.SYNC_SERVICE_TO_USERS
    >,
  ) {}

  async execute(
    command: EditServiceCommand,
  ): Promise<
    Result<void, ServiceNotFoundError | UnauthorizedError | InfrastructureError>
  > {
    const callerRole = this.securityContext.role;
    const callerBusinessId = this.securityContext.businessId;
    const isPartOfSameBusiness = callerBusinessId === command.businessId;

    if (!Service.canEditService(callerRole, isPartOfSameBusiness))
      return err(UNAUTHORIZED_ERROR);

    const found = await this.serviceRepository.findById(command.id);

    if (!found.ok) return err(found.error);

    if (!found.value) {
      return err({
        kind: 'service_not_found',
        message: `Service not found by id: ${command.id}`,
        timestamp: new Date(),
        by: 'id',
        value: command.id,
      } satisfies ServiceNotFoundError);
    }

    const updated = found.value.update({
      title: command.title,
      description: command.description,
      imagesUrls: command.imagesUrls,
      durationInMins: command.durationInMins,
      bufferTimeInMins: command.bufferTimeInMins,
      cost: command.cost,
      isHiddenFromBookingPage: command.isHiddenFromBookingPage,
      updatedBy: command.updatedBy,
    });

    const saved = await this.serviceRepository.update(updated);

    if (!saved.ok) return err(saved.error);

    // sync service groups (full sync — adds new, removes dropped)
    await this.serviceGroupAssignmentQueue.add(
      PIKSLOT_EVENTS.SERVICE_GROUP_ASSIGNMENT.SYNC_SERVICE_SERVICE_GROUPS,
      {
        serviceId: command.id,
        serviceGroupIds: command.associatedServiceGroups,
        businessId: command.businessId,
        assignedBy: command.updatedBy,
      },
    );

    // sync users (full sync — adds new, removes dropped)
    await this.serviceUserAssignmentQueue.add(
      PIKSLOT_EVENTS.SERVICE_USER_ASSIGNMENT.SYNC_SERVICE_TO_USERS,
      {
        serviceId: command.id,
        userIds: command.associatedUsers,
        businessId: command.businessId,
        assignedBy: command.updatedBy,
      },
    );

    return ok(undefined);
  }
}
