import { Selectable, Insertable, Updateable } from 'kysely';
import type { AuditFields } from './audit.table';
import type { CustomerLinks } from '@pikslots/domain';

export interface CustomerTable extends AuditFields {
  id: string; // uuid primary key
  first_name: string;
  last_name: string;
  profile_image_url: string | null;
  email: string | null;
  additional_email: string | null;
  primary_phone: string | null;
  additional_phone: string | null;
  company: string | null;
  country: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  notes: string | null;
  customer_social_links: CustomerLinks; // jsonb
  business_id: string; // fk → businesses.id
}

export type CustomerTableSelect = Selectable<CustomerTable>;
export type CustomerTableInsert = Insertable<CustomerTable>;
export type CustomerTableUpdate = Updateable<CustomerTable>;
