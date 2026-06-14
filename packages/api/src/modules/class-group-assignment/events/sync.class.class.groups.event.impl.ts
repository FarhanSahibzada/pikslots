import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import {
  ClassGroupAssignment,
  IClassGroupAssignmentRepository,
} from '@pikslots/domain';
import type { SyncClassClassGroupsEvent } from '@pikslots/domain';
import { PIKSLOT_EVENTS } from 'src/shared/queue/jobs/pikslot.events';
import { ClassGroupAssignmentJob } from 'src/shared/queue/jobs';
import { v7 as uuidv7 } from 'uuid';
import type { ClassGroupAssignmentRepository } from '@pikslots/domain';

// (single) class --> sync --> class groups (multiple)
@Processor(PIKSLOT_EVENTS.CLASS_GROUP_ASSIGNMENT.SYNC_CLASS_CLASS_GROUPS)
export class SyncClassClassGroupsEventImpl extends WorkerHost {
  constructor(
    @Inject(IClassGroupAssignmentRepository)
    private readonly classGroupAssignmentRepository: ClassGroupAssignmentRepository,
  ) {
    super();
  }

  async process(job: ClassGroupAssignmentJob): Promise<void> {
    const data = job.data as SyncClassClassGroupsEvent;

    const existingResult =
      await this.classGroupAssignmentRepository.findAllByClass(data.classId);

    if (!existingResult.ok)
      throw new Error(JSON.stringify(existingResult.error));

    const existingGroupIds = new Set(
      existingResult.value.map((a) => a.classGroupId),
    );

    const incomingGroupIds = new Set(data.classGroupIds);

    // ── Add new assignments ─────────────────────────────────────────────────

    const newGroupIds = data.classGroupIds.filter(
      (id) => !existingGroupIds.has(id),
    );

    if (newGroupIds.length > 0) {
      const assignments = newGroupIds.map((classGroupId) =>
        ClassGroupAssignment.create({
          id: uuidv7(),
          classId: data.classId,
          classGroupId,
          businessId: data.businessId,
          createdBy: data.assignedBy,
        }),
      );

      const saveResult =
        await this.classGroupAssignmentRepository.saveAll(assignments);

      if (!saveResult.ok) throw new Error(JSON.stringify(saveResult.error));
    }

    // ── Remove dropped assignments ──────────────────────────────────────────

    const toRemove = existingResult.value.filter(
      (a) => !incomingGroupIds.has(a.classGroupId) && !a.isDeleted,
    );

    for (const assignment of toRemove) {
      const deleteResult = await this.classGroupAssignmentRepository.deleteById(
        assignment.id,
      );

      if (!deleteResult.ok) throw new Error(JSON.stringify(deleteResult.error));
    }
  }
}
