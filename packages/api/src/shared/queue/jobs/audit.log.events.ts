import { AuditLogJobDataShape } from '@pikslots/domain';
import { Job } from 'bullmq';
import { PIKSLOT_EVENTS } from './pikslot.events';

// ── Job name type ─────────────────────────────────────────────────────────────
export type AuditLogJobName =
  (typeof PIKSLOT_EVENTS.AUDIT_LOG)[keyof typeof PIKSLOT_EVENTS.AUDIT_LOG];

// ── Job data map  (name → payload) ────────────────────────────────────────────
// Every audit log event shares the same payload shape, so each event name maps
// to AuditLogJobDataShape — no per-event interface needed.
export type AuditLogJobData = {
  [K in AuditLogJobName]: AuditLogJobDataShape;
};

// ── Discriminated union of all audit log jobs ─────────────────────────────────
// Use this as the type for `job` inside a WorkerHost processor.
export type AuditLogJob = {
  [K in AuditLogJobName]: Job<AuditLogJobData[K], void, K>;
}[AuditLogJobName];
