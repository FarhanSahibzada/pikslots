import { Insertable, Selectable } from 'kysely';

export interface AuditLogTable {
  id: string;
  business_id: string | null; // platform owner -> business_id is null
  user_id: string;
  user_type: 'user' | 'system';
  action: string;
  description: string;
  entity_type: string;
  entity_id: string;
  occurred_at: Date;
  ip_address: string | null;
  metadata: Record<string, unknown> | null;
  created_at: Date;
}

export type AuditLogTableSelect = Selectable<AuditLogTable>;
export type AuditLogTableInsert = Insertable<AuditLogTable>;
