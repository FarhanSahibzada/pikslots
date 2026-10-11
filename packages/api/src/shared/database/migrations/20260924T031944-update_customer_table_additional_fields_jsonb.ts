import { Kysely } from 'kysely';
import { PikSlotsDatabase } from '../schema';

export async function up(db: Kysely<PikSlotsDatabase>) {
  await db.schema
    .alterTable('customers')
    .addColumn('additional_fields', 'jsonb')
    .execute();
}

export async function down(db: Kysely<PikSlotsDatabase>) {
  await db.schema
    .alterTable('customers')
    .dropColumn('additional_fields')
    .execute();
}
