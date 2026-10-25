import { Kysely, sql } from 'kysely';
import { PikSlotsDatabase } from '../schema';

export async function up(db: Kysely<PikSlotsDatabase>): Promise<void> {
  await db.schema
    .createTable('audit_logs')
    .addColumn('id', 'uuid', (col) => col.primaryKey().notNull())
    .addColumn('business_id', 'uuid', (col) => col.references('businesses.id'))
    .addColumn('user_id', 'uuid', (col) => col.notNull())
    .addColumn('user_type', 'varchar', (col) => col.notNull())
    .addColumn('action', 'varchar', (col) => col.notNull())
    .addColumn('description', 'varchar', (col) => col.notNull())
    .addColumn('entity_type', 'varchar', (col) => col.notNull())
    .addColumn('entity_id', 'varchar', (col) => col.notNull())
    .addColumn('occurred_at', 'timestamptz', (col) => col.notNull())
    .addColumn('ip_address', 'varchar')
    .addColumn('metadata', 'jsonb')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await db.schema
    .createIndex('idx_audit_logs_business_id')
    .on('audit_logs')
    .column('business_id')
    .execute();

  await db.schema
    .createIndex('idx_audit_logs_user_id')
    .on('audit_logs')
    .column('user_id')
    .execute();

  await db.schema
    .createIndex('idx_audit_logs_entity_type_entity_id')
    .on('audit_logs')
    .columns(['entity_type', 'entity_id'])
    .execute();

  await db.schema
    .createIndex('idx_audit_logs_occurred_at')
    .on('audit_logs')
    .column('occurred_at')
    .execute();
}

export async function down(db: Kysely<PikSlotsDatabase>): Promise<void> {
  await db.schema.dropTable('audit_logs').execute();
}
