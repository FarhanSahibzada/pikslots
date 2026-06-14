import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  InfrastructureError,
  IServiceRepository,
  ok,
  RegisterServiceCommand,
  RegisterServiceUseCase,
  Result,
  Service,
} from '@pikslots/domain';
import type {
  SyncServiceServiceGroupsEvent,
  SyncServiceToUsersEvent,
  ServiceRepository,
  UnauthorizedError,
} from '@pikslots/domain';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { v7 as uuidv7 } from 'uuid';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PIKSLOT_EVENTS } from 'src/shared/queue/jobs/pikslot.events';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'Can not register service : unauthorized!!!',
  timestamp: new Date(),
};

@Injectable()
export class RegisterServiceUseCaseImpl implements RegisterServiceUseCase {
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
    command: RegisterServiceCommand,
  ): Promise<Result<Service, UnauthorizedError | InfrastructureError>> {
    const callerRole = this.securityContext.role;
    const callerBusinessId = this.securityContext.businessId;
    const isPartOfSameBusiness = callerBusinessId === command.businessId;

    if (!Service.canRegisterService(callerRole, isPartOfSameBusiness))
      return err(UNAUTHORIZED_ERROR);

    const service = Service.create({
      id: uuidv7(),
      title: command.title,
      description: command.description,
      imagesUrls: command.imagesUrls,
      durationInMins: command.durationInMins,
      bufferTimeInMins: command.bufferTimeInMins,
      cost: command.cost,
      isHiddenFromBookingPage: command.isHiddenFromBookingPage,
      businessId: command.businessId,
      createdBy: command.createdBy,
    });

    const saved = await this.serviceRepository.save(service);

    if (!saved.ok) return err(saved.error);

    if (command.associatedServiceGroups.length > 0) {
      // (single) service --> sync  --> service groups (multiple)
      await this.serviceGroupAssignmentQueue.add(
        PIKSLOT_EVENTS.SERVICE_GROUP_ASSIGNMENT.SYNC_SERVICE_SERVICE_GROUPS,
        {
          serviceId: service.id,
          serviceGroupIds: command.associatedServiceGroups,
          businessId: command.businessId,
          assignedBy: command.createdBy,
        },
      );
    }

    if (command.associatedUsers.length > 0) {
      // (single) service  --> assing to --> users (multiple)
      await this.serviceUserAssignmentQueue.add(
        PIKSLOT_EVENTS.SERVICE_USER_ASSIGNMENT.SYNC_SERVICE_TO_USERS,
        {
          serviceId: service.id,
          userIds: command.associatedUsers,
          businessId: command.businessId,
          assignedBy: command.createdBy,
        },
      );
    }

    return ok(service);
  }
}
