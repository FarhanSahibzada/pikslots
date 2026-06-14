import { type Kysely, sql } from 'kysely';
import { PikSlotsDatabase } from '../schema';

export async function up(db: Kysely<PikSlotsDatabase>): Promise<void> {
  await db.schema
    .createTable('services')
    .addColumn('id', 'uuid', (col) => col.primaryKey().notNull())
    .addColumn('title', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text', (col) => col.notNull())
    .addColumn('images', 'jsonb', (col) =>
      col.notNull().defaultTo(sql`'[]'::jsonb`),
    )
    .addColumn('duration_in_mins', 'integer', (col) => col.notNull())
    .addColumn('buffer_time_in_mins', 'integer', (col) =>
      col.notNull().defaultTo(0),
    )
    .addColumn('cost', 'integer', (col) => col.notNull())
    .addColumn('is_hidden_from_booking_page', 'boolean', (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn('business_id', 'uuid', (col) =>
      col.notNull().references('businesses.id').onDelete('cascade'),
    )
    // audit
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('created_by', 'uuid', (col) => col.notNull())
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updated_by', 'uuid', (col) => col.notNull())
    .addColumn('deleted_at', 'timestamptz', (col) => col.defaultTo(null))
    .addColumn('deleted_by', 'uuid', (col) => col.defaultTo(null))
    .addColumn('is_deleted', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute();

  // title must be unique within a business
  await db.schema
    .createIndex('idx_service_business_id_title')
    .on('services')
    .columns(['business_id', 'title'])
    .unique()
    .execute();

  await db.schema
    .createIndex('idx_service_business_id')
    .on('services')
    .column('business_id')
    .execute();

  await db.schema
    .createIndex('idx_service_is_deleted')
    .on('services')
    .column('is_deleted')
    .execute();
}

export async function down(db: Kysely<PikSlotsDatabase>): Promise<void> {
  await db.schema.dropTable('services').execute();
}
