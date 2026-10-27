import type { ErrorShape } from '../../shared';

/**
 * No audit log was found for the given lookup value.
 * @example { kind: 'audit_log_not_found', by: 'id', value: '...' }
 */
export type AuditLogNotFound = ErrorShape & {
  kind: 'audit_log_not_found';
  by: 'id';
  value: string | null;
};
