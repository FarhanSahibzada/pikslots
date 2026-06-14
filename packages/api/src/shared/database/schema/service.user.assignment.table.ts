import { Selectable, Insertable, Updateable } from 'kysely';
import type { AuditFields } from './audit.table';

export interface ServiceUserAssignmentTable extends AuditFields {
  id: string; // uuid primary key
  service_id: string; // fk → services.id CASCADE
  user_id: string; // fk → users.id CASCADE
  business_id: string; // fk → businesses.id CASCADE (denormalized)
}

export type ServiceUserAssignmentTableSelect =
  Selectable<ServiceUserAssignmentTable>;
export type ServiceUserAssignmentTableInsert =
  Insertable<ServiceUserAssignmentTable>;
export type ServiceUserAssignmentTableUpdate =
  Updateable<ServiceUserAssignmentTable>;
