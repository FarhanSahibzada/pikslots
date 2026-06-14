import { Selectable, Insertable, Updateable } from 'kysely';
import type { AuditFields } from './audit.table';

export interface ClassGroupAssignmentTable extends AuditFields {
  id: string; // uuid primary key
  class_id: string; // fk → classes.id CASCADE
  class_group_id: string; // fk → class_groups.id CASCADE
  business_id: string; // fk → businesses.id CASCADE (denormalized)
}

export type ClassGroupAssignmentTableSelect = Selectable<ClassGroupAssignmentTable>;
export type ClassGroupAssignmentTableInsert = Insertable<ClassGroupAssignmentTable>;
export type ClassGroupAssignmentTableUpdate = Updateable<ClassGroupAssignmentTable>;
