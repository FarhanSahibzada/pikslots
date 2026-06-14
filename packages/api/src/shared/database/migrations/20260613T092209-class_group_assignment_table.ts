import { type Kysely, sql } from 'kysely';
import { PikSlotsDatabase } from '../schema';

export async function up(db: Kysely<PikSlotsDatabase>): Promise<void> {
  await db.schema
    .createTable('class_group_assignments')
    .addColumn('id', 'uuid', (col) => col.primaryKey().notNull())
    .addColumn('class_id', 'uuid', (col) =>
      col.notNull().references('classes.id').onDelete('cascade'),
    )
    .addColumn('class_group_id', 'uuid', (col) =>
      col.notNull().references('class_groups.id').onDelete('cascade'),
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
    .createIndex('idx_cga_class_id_group_id_active')
    .on('class_group_assignments')
    .columns(['class_id', 'class_group_id'])
    .unique()
    .where(sql.ref('is_deleted'), '=', false)
    .execute();

  await db.schema
    .createIndex('idx_cga_class_group_id')
    .on('class_group_assignments')
    .column('class_group_id')
    .execute();

  await db.schema
    .createIndex('idx_cga_class_id')
    .on('class_group_assignments')
    .column('class_id')
    .execute();

  await db.schema
    .createIndex('idx_cga_business_id')
    .on('class_group_assignments')
    .column('business_id')
    .execute();

  await db.schema
    .createIndex('idx_cga_is_deleted')
    .on('class_group_assignments')
    .column('is_deleted')
    .execute();
}

export async function down(db: Kysely<PikSlotsDatabase>): Promise<void> {
  await db.schema.dropTable('class_group_assignments').execute();
}
