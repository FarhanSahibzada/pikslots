import { Kysely } from 'kysely';
import { PikslotsDatabaseModule } from '../pikslots.database.module';

export async function up(db: Kysely<PikslotsDatabaseModule>) {
  await db.schema
    .alterTable('bookings')
    .addColumn('label', 'varchar')
    .addColumn('notes', 'varchar')
    .execute();
}

export async function down(db: Kysely<PikslotsDatabaseModule>) {
  await db.schema
    .alterTable('bookings')
    .dropColumn('label')
    .dropColumn('notes')
    .execute();
}
