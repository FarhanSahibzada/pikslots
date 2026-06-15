import { type Kysely, sql } from 'kysely';
import { PikSlotsDatabase } from '../schema';

export async function up(db: Kysely<PikSlotsDatabase>): Promise<void> {
  await db.schema
    .createTable('customers')
    .addColumn('id', 'uuid', (col) => col.primaryKey().notNull())
    .addColumn('first_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('last_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('profile_image_url', 'varchar(2048)', (col) =>
      col.defaultTo(null),
    )
    .addColumn('email', 'varchar(255)', (col) => col.defaultTo(null))
    .addColumn('additional_email', 'varchar(255)', (col) => col.defaultTo(null))
    .addColumn('primary_phone', 'varchar(50)', (col) => col.defaultTo(null))
    .addColumn('additional_phone', 'varchar(50)', (col) => col.defaultTo(null))
    .addColumn('company', 'varchar(255)', (col) => col.defaultTo(null))
    .addColumn('country', 'varchar(100)', (col) => col.defaultTo(null))
    .addColumn('address', 'varchar(500)', (col) => col.defaultTo(null))
    .addColumn('city', 'varchar(100)', (col) => col.defaultTo(null))
    .addColumn('state', 'varchar(100)', (col) => col.defaultTo(null))
    .addColumn('zip_code', 'varchar(20)', (col) => col.defaultTo(null))
    .addColumn('notes', 'varchar(255)', (col) => col.defaultTo(null))
    .addColumn('customer_social_links', 'jsonb', (col) =>
      col.notNull().defaultTo(sql`'{}'::jsonb`),
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

  // unique active email per business — NULLs are excluded from uniqueness in PG
  await db.schema
    .createIndex('idx_customer_business_id_email_active')
    .on('customers')
    .columns(['business_id', 'email'])
    .unique()
    .where(sql.ref('is_deleted'), '=', false)
    .where(sql.ref('email'), 'is not', null)
    .execute();

  // unique active additional_email per business
  await db.schema
    .createIndex('idx_customer_business_id_additional_email_active')
    .on('customers')
    .columns(['business_id', 'additional_email'])
    .unique()
    .where(sql.ref('is_deleted'), '=', false)
    .where(sql.ref('additional_email'), 'is not', null)
    .execute();

  // unique active primary_phone per business
  await db.schema
    .createIndex('idx_customer_business_id_primary_phone_active')
    .on('customers')
    .columns(['business_id', 'primary_phone'])
    .unique()
    .where(sql.ref('is_deleted'), '=', false)
    .where(sql.ref('primary_phone'), 'is not', null)
    .execute();

  // unique active additional_phone per business
  await db.schema
    .createIndex('idx_customer_business_id_additional_phone_active')
    .on('customers')
    .columns(['business_id', 'additional_phone'])
    .unique()
    .where(sql.ref('is_deleted'), '=', false)
    .where(sql.ref('additional_phone'), 'is not', null)
    .execute();

  await db.schema
    .createIndex('idx_customer_business_id')
    .on('customers')
    .column('business_id')
    .execute();

  await db.schema
    .createIndex('idx_customer_is_deleted')
    .on('customers')
    .column('is_deleted')
    .execute();
}

export async function down(db: Kysely<PikSlotsDatabase>): Promise<void> {
  await db.schema.dropTable('customers').execute();
}
