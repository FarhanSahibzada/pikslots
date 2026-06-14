import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import {
  ClassGroupAssignment,
  IClassGroupAssignmentRepository,
} from '@pikslots/domain';
import type { SyncClassGroupClassesEvent } from '@pikslots/domain';
import { PIKSLOT_EVENTS } from 'src/shared/queue/jobs/pikslot.events';
import { ClassGroupAssignmentJob } from 'src/shared/queue/jobs';
import { v7 as uuidv7 } from 'uuid';
import type { ClassGroupAssignmentRepository } from '@pikslots/domain';

// (single) class group --> sync --> classes (multiple)
@Processor(PIKSLOT_EVENTS.CLASS_GROUP_ASSIGNMENT.SYNC_CLASS_GROUP_CLASSES)
export class SyncClassGroupClassesEventImpl extends WorkerHost {
  constructor(
    @Inject(IClassGroupAssignmentRepository)
    private readonly classGroupAssignmentRepository: ClassGroupAssignmentRepository,
  ) {
    super();
  }

  async process(job: ClassGroupAssignmentJob): Promise<void> {
    const data = job.data as SyncClassGroupClassesEvent;

    const existingResult =
      await this.classGroupAssignmentRepository.findAllByClassGroup(
        data.classGroupId,
      );

    if (!existingResult.ok)
      throw new Error(JSON.stringify(existingResult.error));

    const existingClassIds = new Set(
      existingResult.value.map((a) => a.classId),
    );

    const incomingClassIds = new Set(data.classIds);

    // ── Add new assignments ─────────────────────────────────────────────────

    const newClassIds = data.classIds.filter((id) => !existingClassIds.has(id));

    if (newClassIds.length > 0) {
      const assignments = newClassIds.map((classId) =>
        ClassGroupAssignment.create({
          id: uuidv7(),
          classId,
          classGroupId: data.classGroupId,
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
      (a) => !incomingClassIds.has(a.classId) && !a.isDeleted,
    );

    for (const assignment of toRemove) {
      const deleteResult = await this.classGroupAssignmentRepository.deleteById(
        assignment.id,
      );

      if (!deleteResult.ok) throw new Error(JSON.stringify(deleteResult.error));
    }
  }
}
