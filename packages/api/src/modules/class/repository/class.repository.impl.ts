import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  ok,
  Class,
  ClassNotFoundError,
  ClassRepository,
  InfrastructureError,
  Result,
} from '@pikslots/domain';
import { Kysely } from 'kysely';
import { PIKSLOTS_DB } from 'src/shared/database/pikslots.database.module';
import { PikSlotsDatabase } from 'src/shared/database/schema';
import { ClassPersistenceMapper } from '../mappers/class.database.mapper';

@Injectable()
export class ClassRepositoryImpl implements ClassRepository {
  private readonly mapper = new ClassPersistenceMapper();

  constructor(
    @Inject(PIKSLOTS_DB) private readonly db: Kysely<PikSlotsDatabase>,
  ) {}

  async save(cls: Class): Promise<Result<void, InfrastructureError>> {
    try {
      await this.db
        .insertInto('classes')
        .values(this.mapper.domainToPersistence(cls))
        .execute();
      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to save class',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findById(
    id: string,
  ): Promise<Result<Class | null, ClassNotFoundError | InfrastructureError>> {
    try {
      const row = await this.db
        .selectFrom('classes')
        .selectAll()
        .where('id', '=', id)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      if (!row) return ok(null);

      return ok(this.mapper.persistenceToDomain(row));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find class by id',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findAllByBusiness(
    businessId: string,
  ): Promise<Result<Class[], InfrastructureError>> {
    try {
      const rows = await this.db
        .selectFrom('classes')
        .selectAll()
        .where('business_id', '=', businessId)
        .where('is_deleted', '=', false)
        .execute();

      return ok(rows.map((row) => this.mapper.persistenceToDomain(row)));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find classes by business',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async update(
    cls: Class,
  ): Promise<Result<void, ClassNotFoundError | InfrastructureError>> {
    try {
      const result = await this.db
        .updateTable('classes')
        .set(this.mapper.domainToPersistence(cls))
        .where('id', '=', cls.id)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      if (!result.numUpdatedRows || result.numUpdatedRows === BigInt(0)) {
        return err<ClassNotFoundError>({
          kind: 'class_not_found',
          by: 'id',
          value: cls.id,
          message: `Class not found against ${cls.id}`,
          timestamp: new Date(),
        });
      }

      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to update class',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async delete(
    id: string,
  ): Promise<Result<void, ClassNotFoundError | InfrastructureError>> {
    try {
      const result = await this.db
        .deleteFrom('classes')
        .where('id', '=', id)
        .executeTakeFirst();

      if (!result.numDeletedRows || result.numDeletedRows === BigInt(0)) {
        return err<ClassNotFoundError>({
          kind: 'class_not_found',
          by: 'id',
          value: id,
          message: `Class not found against ${id}`,
          timestamp: new Date(),
        });
      }

      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to delete class',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async existsByTitle(
    title: string,
    businessId: string,
  ): Promise<Result<boolean, InfrastructureError>> {
    try {
      const row = await this.db
        .selectFrom('classes')
        .select('id')
        .where('title', '=', title)
        .where('business_id', '=', businessId)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      return ok(row !== undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to check class existence by title',
        timestamp: new Date(),
        cause,
      });
    }
  }
}
