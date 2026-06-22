import { type Kysely, sql } from 'kysely';
import { PikSlotsDatabase } from '../schema';

export async function up(db: Kysely<PikSlotsDatabase>): Promise<void> {
  await db.schema
    .createTable('bookings')
    .addColumn('id', 'uuid', (col) => col.primaryKey().notNull())
    .addColumn('booking_id', 'varchar(50)', (col) => col.notNull())
    .addColumn('booking_date', 'date', (col) => col.notNull())
    .addColumn('booking_start_time', 'timestamptz', (col) => col.notNull())
    .addColumn('booking_end_time', 'timestamptz', (col) => col.notNull())
    .addColumn('business_id', 'uuid', (col) =>
      col.notNull().references('businesses.id').onDelete('cascade'),
    )
    .addColumn('service_id', 'uuid', (col) =>
      col.references('services.id').onDelete('restrict'),
    )
    .addColumn('service_snapshot', 'jsonb', (col) => col.notNull())
    .addColumn('customer_id', 'uuid', (col) =>
      col.notNull().references('customers.id').onDelete('restrict'),
    )
    .addColumn('user_id', 'uuid', (col) =>
      col.references('users.id').onDelete('restrict'),
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

  // human-readable booking_id unique per business
  await db.schema
    .createIndex('idx_booking_business_id_booking_id')
    .on('bookings')
    .columns(['business_id', 'booking_id'])
    .unique()
    .execute();

  // prevent double-booking: no two active bookings on the same business can overlap
  // enforced via partial index — overlapping time range constraint handled in app layer via hasConflict()
  await db.schema
    .createIndex('idx_booking_business_time_active')
    .on('bookings')
    .columns(['business_id', 'booking_start_time', 'booking_end_time'])
    .where(sql.ref('is_deleted'), '=', false)
    .execute();

  await db.schema
    .createIndex('idx_booking_business_id')
    .on('bookings')
    .column('business_id')
    .execute();

  await db.schema
    .createIndex('idx_booking_service_id')
    .on('bookings')
    .column('service_id')
    .execute();

  await db.schema
    .createIndex('idx_booking_customer_id')
    .on('bookings')
    .column('customer_id')
    .execute();

  await db.schema
    .createIndex('idx_booking_booking_date')
    .on('bookings')
    .column('booking_date')
    .execute();

  await db.schema
    .createIndex('idx_booking_is_deleted')
    .on('bookings')
    .column('is_deleted')
    .execute();

  await db.schema
    .createIndex('idx_booking_user_id')
    .on('bookings')
    .column('user_id')
    .execute();
}

export async function down(db: Kysely<PikSlotsDatabase>): Promise<void> {
  await db.schema.dropTable('bookings').execute();
}
