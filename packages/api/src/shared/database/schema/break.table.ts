import { Selectable, Insertable, Updateable } from 'kysely';
import type { AuditFields } from './audit.table';
import type { WeekDay } from '@pikslots/domain';

export interface BreakTable extends AuditFields {
  id: string; // uuid primary key
  day: WeekDay; // day of week the break applies to
  start_time: string; // 'HH:mm' 24-hour format
  end_time: string; // 'HH:mm' 24-hour format
  user_id: string; // fk → users.id
  business_id: string; // fk → businesses.id
}

export type BreakTableSelect = Selectable<BreakTable>;
export type BreakTableInsert = Insertable<BreakTable>;
export type BreakTableUpdate = Updateable<BreakTable>;
