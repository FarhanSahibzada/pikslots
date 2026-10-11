import { Kysely, sql } from 'kysely';
import { PikSlotsDatabase } from '../schema';

export async function up(db: Kysely<PikSlotsDatabase>) {
  await db.schema
    .createIndex('idx_customers_business_id_first_name')
    .on('customers')
    .columns(['business_id', 'first_name'])
    .where(sql.ref('is_deleted'), '=', false)
    .where(sql.ref('first_name'), 'is not', null)
    .execute();
}

export async function down(db: Kysely<PikSlotsDatabase>) {
  await db.schema.dropIndex('idx_customers_business_id_first_name').execute();
}
