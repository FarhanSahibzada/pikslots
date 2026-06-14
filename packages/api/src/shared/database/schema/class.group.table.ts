import { Selectable, Insertable, Updateable } from 'kysely';
import type { AuditFields } from './audit.table';

export interface ClassGroupTable extends AuditFields {
  id: string; // uuid primary key
  name: string; // unique per business — enforced by (name, business_id) composite index
  business_id: string; // fk → businesses.id
}

export type ClassGroupTableSelect = Selectable<ClassGroupTable>;
export type ClassGroupTableInsert = Insertable<ClassGroupTable>;
export type ClassGroupTableUpdate = Updateable<ClassGroupTable>;
