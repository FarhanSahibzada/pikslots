import { Selectable, Insertable, Updateable } from 'kysely';
import type { AuditFields } from './audit.table';
import type { ServiceSnapshot } from '@pikslots/domain';

export interface BookingTable extends AuditFields {
  id: string; // uuid primary key
  booking_id: string; // human-readable reference e.g. "BK-0001"
  booking_date: Date; // date of the booking (date-only column)
  booking_start_time: Date; // UTC timestamptz
  booking_end_time: Date; // UTC timestamptz
  business_id: string; // fk → businesses.id
  service_id: string; // fk → services.id
  customer_id: string; // fk → customers.id
  user_id: string; // fk → users.id
  service_snapshot: ServiceSnapshot; // jsonb — frozen copy at booking time
}

export type BookingTableSelect = Selectable<BookingTable>;
export type BookingTableInsert = Insertable<BookingTable>;
export type BookingTableUpdate = Updateable<BookingTable>;
