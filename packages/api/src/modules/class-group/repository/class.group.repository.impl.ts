import { Inject, Injectable } from '@nestjs/common';
import {
  ClassGroup,
  ClassGroupAlreadyExistsInBusinessError,
  ClassGroupNotFoundError,
  ClassGroupRepository,
  err,
  InfrastructureError,
  ok,
  Result,
} from '@pikslots/domain';
import { Kysely } from 'kysely';
import { PIKSLOTS_DB } from 'src/shared/database/pikslots.database.module';
import { isUniqueViolation } from 'src/shared/database/helpers/postgres.errors';
import { PikSlotsDatabase } from 'src/shared/database/schema';
import { ClassGroupPersistenceMapper } from '../mappers/class.group.database.mapper';

@Injectable()
export class ClassGroupRepositoryImpl implements ClassGroupRepository {
  private readonly mapper = new ClassGroupPersistenceMapper();

  constructor(
    @Inject(PIKSLOTS_DB) private readonly db: Kysely<PikSlotsDatabase>,
  ) {}

  async save(
    group: ClassGroup,
  ): Promise<
    Result<void, ClassGroupAlreadyExistsInBusinessError | InfrastructureError>
  > {
    try {
      await this.db
        .insertInto('class_groups')
        .values(this.mapper.domainToPersistence(group))
        .execute();
      return ok(undefined);
    } catch (cause) {
      if (isUniqueViolation(cause)) {
        return err<ClassGroupAlreadyExistsInBusinessError>({
          kind: 'class_group_already_exists',
          name: group.name,
          businessId: group.businessId,
          message: `A class group named '${group.name}' already exists for this business`,
          timestamp: new Date(),
        });
      }

      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to save class group',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findById(
    id: string,
  ): Promise<
    Result<ClassGroup | null, ClassGroupNotFoundError | InfrastructureError>
  > {
    try {
      const row = await this.db
        .selectFrom('class_groups')
        .selectAll()
        .where('id', '=', id)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      if (!row) return ok(null);

      return ok(this.mapper.persistenceToDomain(row));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find class group by id',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findAllByBusiness(
    businessId: string,
  ): Promise<Result<ClassGroup[], InfrastructureError>> {
    try {
      const rows = await this.db
        .selectFrom('class_groups')
        .selectAll()
        .where('business_id', '=', businessId)
        .where('is_deleted', '=', false)
        .execute();

      return ok(rows.map((row) => this.mapper.persistenceToDomain(row)));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find class groups by business',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async update(
    group: ClassGroup,
  ): Promise<Result<void, ClassGroupNotFoundError | InfrastructureError>> {
    try {
      const result = await this.db
        .updateTable('class_groups')
        .set(this.mapper.domainToPersistence(group))
        .where('id', '=', group.id)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      if (!result.numUpdatedRows || result.numUpdatedRows === BigInt(0)) {
        return err<ClassGroupNotFoundError>({
          kind: 'class_group_not_found',
          by: 'id',
          value: group.id,
          message: `Class group not found against ${group.id}`,
          timestamp: new Date(),
        });
      }

      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to update class group',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async delete(
    id: string,
  ): Promise<Result<void, ClassGroupNotFoundError | InfrastructureError>> {
    try {
      const result = await this.db
        .deleteFrom('class_groups')
        .where('id', '=', id)
        .executeTakeFirst();

      if (!result.numDeletedRows || result.numDeletedRows === BigInt(0)) {
        return err<ClassGroupNotFoundError>({
          kind: 'class_group_not_found',
          by: 'id',
          value: id,
          message: `Class group not found against ${id}`,
          timestamp: new Date(),
        });
      }

      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to delete class group',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async existsByName(
    name: string,
    businessId: string,
  ): Promise<Result<boolean, InfrastructureError>> {
    try {
      const row = await this.db
        .selectFrom('class_groups')
        .select('id')
        .where('name', '=', name)
        .where('business_id', '=', businessId)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      return ok(row !== undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to check class group existence by name',
        timestamp: new Date(),
        cause,
      });
    }
  }
}
