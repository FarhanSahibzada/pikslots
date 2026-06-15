import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import {
  IServiceUserAssignmentRepository,
  ServiceUserAssignment,
} from '@pikslots/domain';
import { PIKSLOT_EVENTS } from 'src/shared/queue/jobs/pikslot.events';
import type {
  SyncServiceToUsersEvent,
  ServiceUserAssignmentRepository,
} from '@pikslots/domain';
import { v7 as uuidv7 } from 'uuid';
import { ServiceUserAssignmentJob } from 'src/shared/queue/jobs';

// (single) service --> sync --> users (multiple)
@Processor(PIKSLOT_EVENTS.SERVICE_USER_ASSIGNMENT.SYNC_SERVICE_TO_USERS)
export class SyncServiceToUsersEventImpl extends WorkerHost {
  constructor(
    @Inject(IServiceUserAssignmentRepository)
    private readonly serviceUserAssignmentRepository: ServiceUserAssignmentRepository,
  ) {
    super();
  }

  async process(job: ServiceUserAssignmentJob): Promise<void> {
    const data = job.data as SyncServiceToUsersEvent;

    const existingResult =
      await this.serviceUserAssignmentRepository.findAllByService(
        data.serviceId,
      );

    if (!existingResult.ok)
      throw new Error(JSON.stringify(existingResult.error));

    const existingUserIds = new Set(existingResult.value.map((a) => a.userId));
    const incomingUserIds = new Set(data.userIds);

    // ── Add new assignments ─────────────────────────────────────────────────

    const newUserIds = data.userIds.filter((id) => !existingUserIds.has(id));

    if (newUserIds.length > 0) {
      const assignments = newUserIds.map((userId) =>
        ServiceUserAssignment.create({
          id: uuidv7(),
          serviceId: data.serviceId,
          userId,
          businessId: data.businessId,
          createdBy: data.assignedBy,
        }),
      );

      const saveResult =
        await this.serviceUserAssignmentRepository.saveAll(assignments);

      if (!saveResult.ok) throw new Error(JSON.stringify(saveResult.error));
    }

    // ── Remove dropped assignments ──────────────────────────────────────────

    const toRemove = existingResult.value.filter(
      (a) => !incomingUserIds.has(a.userId),
    );

    for (const assignment of toRemove) {
      const deleteResult =
        await this.serviceUserAssignmentRepository.deleteById(assignment.id);

      if (!deleteResult.ok) throw new Error(JSON.stringify(deleteResult.error));
    }
  }
}
