import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import {
  Class,
  err,
  IClassRepository,
  InfrastructureError,
  ok,
  RegisterClassCommand,
  RegisterClassUseCase,
  Result,
} from '@pikslots/domain';
import type {
  SyncClassClassGroupsEvent,
  UnauthorizedError,
  ClassRepository,
} from '@pikslots/domain';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { v7 as uuidv7 } from 'uuid';
import { Queue } from 'bullmq';
import { PIKSLOT_EVENTS } from 'src/shared/queue/jobs/pikslot.events';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'Can not register class : unauthorized!!!',
  timestamp: new Date(),
};

@Injectable()
export class RegisterClassUseCaseImpl implements RegisterClassUseCase {
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
    command: RegisterClassCommand,
  ): Promise<Result<Class, UnauthorizedError | InfrastructureError>> {
    const callerRole = this.securityContext.role;
    const callerBusinessId = this.securityContext.businessId;
    const isPartOfSameBusiness = callerBusinessId === command.businessId;

    if (!Class.canRegisterClass(callerRole, isPartOfSameBusiness))
      return err(UNAUTHORIZED_ERROR);

    const cls = Class.create({
      id: uuidv7(),
      title: command.title,
      description: command.description,
      imagesUrls: command.imagesUrls,
      durationInMins: command.durationInMins,
      seats: command.seats,
      cost: command.cost,
      isHiddenFromBookingPage: command.isHiddenFromBookingPage,
      businessId: command.businessId,
      createdBy: command.createdBy,
    });

    const saved = await this.classRepository.save(cls);
    if (!saved.ok) return err(saved.error);

    if (command.associatedClassGroupIds.length > 0) {
      // (single) class --> sync --> class groups (multiple)
      await this.classGroupAssignmentQueue.add(
        PIKSLOT_EVENTS.CLASS_GROUP_ASSIGNMENT.SYNC_CLASS_CLASS_GROUPS,
        {
          classId: cls.id,
          classGroupIds: command.associatedClassGroupIds,
          businessId: command.businessId,
          assignedBy: command.createdBy,
        },
      );
    }

    return ok(cls);
  }
}
