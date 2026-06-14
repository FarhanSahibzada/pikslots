import { Selectable, Insertable, Updateable } from 'kysely';
import type { AuditFields } from './audit.table';

export interface ServiceGroupTable extends AuditFields {
  id: string; // uuid primary key
  name: string; // unique per business — enforced by (name, business_id) composite index
  business_id: string; // fk → businesses.id
}

export type ServiceGroupTableSelect = Selectable<ServiceGroupTable>;
export type ServiceGroupTableInsert = Insertable<ServiceGroupTable>;
export type ServiceGroupTableUpdate = Updateable<ServiceGroupTable>;
