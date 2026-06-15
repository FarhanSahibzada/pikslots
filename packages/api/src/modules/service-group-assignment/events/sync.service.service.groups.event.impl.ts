import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import {
  IServiceGroupAssignmentRepository,
  ServiceGroupAssignment,
} from '@pikslots/domain';
import { PIKSLOT_EVENTS } from 'src/shared/queue/jobs/pikslot.events';
import type {
  SyncServiceServiceGroupsEvent,
  ServiceGroupAssignmentRepository,
} from '@pikslots/domain';
import { v7 as uuidv7 } from 'uuid';
import { ServiceGroupAssignmentJob } from 'src/shared/queue/jobs';

// (single) service --> sync --> service groups (multiple)
@Processor(PIKSLOT_EVENTS.SERVICE_GROUP_ASSIGNMENT.SYNC_SERVICE_SERVICE_GROUPS)
export class SyncServiceServiceGroupsEventImpl extends WorkerHost {
  constructor(
    @Inject(IServiceGroupAssignmentRepository)
    private readonly serviceGroupAssignmentRepository: ServiceGroupAssignmentRepository,
  ) {
    super();
  }

  async process(job: ServiceGroupAssignmentJob): Promise<void> {
    const data = job.data as SyncServiceServiceGroupsEvent;

    const existingResult =
      await this.serviceGroupAssignmentRepository.findAllByService(
        data.serviceId,
      );

    if (!existingResult.ok)
      throw new Error(JSON.stringify(existingResult.error));

    const existingGroupIds = new Set(
      existingResult.value.map((a) => a.serviceGroupId),
    );

    const incomingGroupIds = new Set(data.serviceGroupIds);

    // ── Add new assignments ─────────────────────────────────────────────────

    const newGroupIds = data.serviceGroupIds.filter(
      (id) => !existingGroupIds.has(id),
    );

    if (newGroupIds.length > 0) {
      const now = new Date();

      const assignments = newGroupIds.map((serviceGroupId) =>
        ServiceGroupAssignment.create({
          id: uuidv7(),
          serviceId: data.serviceId,
          serviceGroupId,
          businessId: data.businessId,
          createdBy: data.assignedBy,
          createdAt: now,
          updatedAt: now,
          updatedBy: data.assignedBy,
          deletedAt: null,
          deletedBy: null,
          isDeleted: false,
        }),
      );

      const saveResult =
        await this.serviceGroupAssignmentRepository.saveAll(assignments);

      if (!saveResult.ok) throw new Error(JSON.stringify(saveResult.error));
    }

    // ── Remove dropped assignments ──────────────────────────────────────────

    const toRemove = existingResult.value.filter(
      (a) => !incomingGroupIds.has(a.serviceGroupId) && !a.isDeleted,
    );

    for (const assignment of toRemove) {
      const deleteResult =
        await this.serviceGroupAssignmentRepository.deleteById(assignment.id);

      if (!deleteResult.ok) throw new Error(JSON.stringify(deleteResult.error));
    }
  }
}
