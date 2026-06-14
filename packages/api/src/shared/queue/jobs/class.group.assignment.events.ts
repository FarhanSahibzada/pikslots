import {
  SyncClassClassGroupsEvent,
  SyncClassGroupClassesEvent,
} from '@pikslots/domain';
import { Job } from 'bullmq';
import { PIKSLOT_EVENTS } from './pikslot.events';

// ── Job name type ─────────────────────────────────────────────────────────────
export type ClassGroupAssignmentJobName =
  (typeof PIKSLOT_EVENTS.CLASS_GROUP_ASSIGNMENT)[keyof typeof PIKSLOT_EVENTS.CLASS_GROUP_ASSIGNMENT];

// ── Job data map  (name → payload) ────────────────────────────────────────────

export interface ClassGroupAssignmentJobData {
  [PIKSLOT_EVENTS.CLASS_GROUP_ASSIGNMENT
    .SYNC_CLASS_CLASS_GROUPS]: SyncClassClassGroupsEvent;

  [PIKSLOT_EVENTS.CLASS_GROUP_ASSIGNMENT
    .SYNC_CLASS_GROUP_CLASSES]: SyncClassGroupClassesEvent;
}

// ── Discriminated union of all class group assignment jobs ────────────────────
// Use this as the type for `job` inside a WorkerHost processor.
export type ClassGroupAssignmentJob = {
  [K in ClassGroupAssignmentJobName]: Job<
    ClassGroupAssignmentJobData[K],
    void,
    K
  >;
}[ClassGroupAssignmentJobName];
