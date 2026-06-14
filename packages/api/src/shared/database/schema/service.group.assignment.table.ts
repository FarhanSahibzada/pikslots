import { Selectable, Insertable, Updateable } from 'kysely';
import type { AuditFields } from './audit.table';

export interface ServiceGroupAssignmentTable extends AuditFields {
  id: string; // uuid primary key
  service_id: string; // fk → services.id CASCADE
  service_group_id: string; // fk → service_groups.id CASCADE
  business_id: string; // fk → businesses.id CASCADE (denormalized)
}

export type ServiceGroupAssignmentTableSelect = Selectable<ServiceGroupAssignmentTable>;
export type ServiceGroupAssignmentTableInsert = Insertable<ServiceGroupAssignmentTable>;
export type ServiceGroupAssignmentTableUpdate = Updateable<ServiceGroupAssignmentTable>;
