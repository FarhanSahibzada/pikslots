import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('service_user_assignments')
    .addColumn('id', 'uuid', (col) => col.primaryKey().notNull())
    .addColumn('service_id', 'uuid', (col) =>
      col.notNull().references('services.id').onDelete('cascade'),
    )
    .addColumn('user_id', 'uuid', (col) =>
      col.notNull().references('users.id').onDelete('cascade'),
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

  // prevent duplicate active assignments — partial index allows re-adding after soft-delete
  await db.schema
    .createIndex('idx_sua_service_id_user_id_active')
    .on('service_user_assignments')
    .columns(['service_id', 'user_id'])
    .unique()
    .where(sql.ref('is_deleted'), '=', false)
    .execute();

  await db.schema
    .createIndex('idx_sua_service_id')
    .on('service_user_assignments')
    .column('service_id')
    .execute();

  await db.schema
    .createIndex('idx_sua_user_id')
    .on('service_user_assignments')
    .column('user_id')
    .execute();

  await db.schema
    .createIndex('idx_sua_business_id')
    .on('service_user_assignments')
    .column('business_id')
    .execute();

  await db.schema
    .createIndex('idx_sua_is_deleted')
    .on('service_user_assignments')
    .column('is_deleted')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('service_user_assignments').execute();
}
