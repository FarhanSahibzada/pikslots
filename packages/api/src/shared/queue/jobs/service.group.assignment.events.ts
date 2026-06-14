import {
  SyncServiceServiceGroupsEvent,
  SyncServiceGroupServicesEvent,
} from '@pikslots/domain';
import { Job } from 'bullmq';
import { PIKSLOT_EVENTS } from './pikslot.events';

// ── Job name type ─────────────────────────────────────────────────────────────
export type ServiceGroupAssignmentJobName =
  (typeof PIKSLOT_EVENTS.SERVICE_GROUP_ASSIGNMENT)[keyof typeof PIKSLOT_EVENTS.SERVICE_GROUP_ASSIGNMENT];

// ── Job data map  (name → payload) ────────────────────────────────────────────

export interface ServiceGroupAssingmentJobData {
  [PIKSLOT_EVENTS.SERVICE_GROUP_ASSIGNMENT
    .SYNC_SERVICE_SERVICE_GROUPS]: SyncServiceServiceGroupsEvent;

  [PIKSLOT_EVENTS.SERVICE_GROUP_ASSIGNMENT
    .SYNC_SERVICE_GROUP_SERVICES]: SyncServiceGroupServicesEvent;
}

// ── Discriminated union of all user jobs ──────────────────────────────────────
// Use this as the type for `job` inside a WorkerHost processor.
export type ServiceGroupAssignmentJob = {
  [K in ServiceGroupAssignmentJobName]: Job<
    ServiceGroupAssingmentJobData[K],
    void,
    K
  >;
}[ServiceGroupAssignmentJobName];
