import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import {
  IServiceGroupAssignmentRepository,
  ServiceGroupAssignment,
} from '@pikslots/domain';
import { PIKSLOT_EVENTS } from 'src/shared/queue/jobs/pikslot.events';
import type {
  SyncServiceGroupServicesEvent,
  ServiceGroupAssignmentRepository,
} from '@pikslots/domain';
import { v7 as uuidv7 } from 'uuid';
import { ServiceGroupAssignmentJob } from 'src/shared/queue/jobs';

// (single) service group --> sync --> services (multiple)
@Processor(PIKSLOT_EVENTS.SERVICE_GROUP_ASSIGNMENT.SYNC_SERVICE_GROUP_SERVICES)
export class SyncServiceGroupServicesEventImpl extends WorkerHost {
  constructor(
    @Inject(IServiceGroupAssignmentRepository)
    private readonly serviceGroupAssignmentRepository: ServiceGroupAssignmentRepository,
  ) {
    super();
  }

  async process(job: ServiceGroupAssignmentJob): Promise<void> {
    // extract the typed event payload from the BullMQ job
    const data = job.data as SyncServiceGroupServicesEvent;

    // fetch all current (non-deleted) assignments for this service group in one query
    const existingResult =
      await this.serviceGroupAssignmentRepository.findAllByServiceGroup(
        data.serviceGroupId,
      );

    // propagate infrastructure failure so BullMQ can retry the job
    if (!existingResult.ok)
      throw new Error(JSON.stringify(existingResult.error));

    // build a set of already-assigned service IDs for O(1) lookup
    const existingServiceIds = new Set(
      existingResult.value.map((a) => a.serviceId),
    );

    const incomingServiceIds = new Set(data.serviceIds);

    // ── Add new assignments ─────────────────────────────────────────────────

    const newServiceIds = data.serviceIds.filter(
      (id) => !existingServiceIds.has(id),
    );

    if (newServiceIds.length > 0) {
      const now = new Date();

      const assignments = newServiceIds.map((serviceId) =>
        ServiceGroupAssignment.create({
          id: uuidv7(),
          serviceId,
          serviceGroupId: data.serviceGroupId,
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
      (a) => !incomingServiceIds.has(a.serviceId) && !a.isDeleted,
    );

    for (const assignment of toRemove) {
      const deleteResult =
        await this.serviceGroupAssignmentRepository.deleteById(assignment.id);

      if (!deleteResult.ok) throw new Error(JSON.stringify(deleteResult.error));
    }
  }
}
