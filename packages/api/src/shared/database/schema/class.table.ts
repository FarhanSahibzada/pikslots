import { Selectable, Insertable, Updateable } from 'kysely';
import type { AuditFields } from './audit.table';

export interface ClassTable extends AuditFields {
  id: string; // uuid primary key
  title: string; // unique per business
  description: string;
  images: string[]; // max 5 image URLs
  duration_in_mins: number;
  seats: number;
  cost: number;
  is_hidden_from_booking_page: boolean;
  business_id: string; // fk → businesses.id
}

export type ClassTableSelect = Selectable<ClassTable>;
export type ClassTableInsert = Insertable<ClassTable>;
export type ClassTableUpdate = Updateable<ClassTable>;
