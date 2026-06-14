import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  ok,
  InfrastructureError,
  Result,
  ServiceGroup,
  ServiceGroupAlreadyExistsInBusinessError,
  ServiceGroupNotFoundError,
  ServiceGroupRepository,
} from '@pikslots/domain';
import { Kysely } from 'kysely';
import { PIKSLOTS_DB } from 'src/shared/database/pikslots.database.module';
import { isUniqueViolation } from 'src/shared/database/helpers/postgres.errors';
import { PikSlotsDatabase } from 'src/shared/database/schema';
import { ServiceGroupPersistenceMapper } from '../mappers/service.group.database.mapper';

@Injectable()
export class ServiceGroupRepositoryImpl implements ServiceGroupRepository {
  private readonly mapper = new ServiceGroupPersistenceMapper();

  constructor(
    @Inject(PIKSLOTS_DB) private readonly db: Kysely<PikSlotsDatabase>,
  ) {}

  async save(
    group: ServiceGroup,
  ): Promise<
    Result<void, ServiceGroupAlreadyExistsInBusinessError | InfrastructureError>
  > {
    try {
      await this.db
        .insertInto('service_groups')
        .values(this.mapper.domainToPersistence(group))
        .execute();
      return ok(undefined);
    } catch (cause) {
      if (isUniqueViolation(cause)) {
        return err<ServiceGroupAlreadyExistsInBusinessError>({
          kind: 'service_group_already_exists',
          name: group.name,
          businessId: group.businessId,
          message: `A service group named '${group.name}' already exists for this business`,
          timestamp: new Date(),
        });
      }

      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to save service group',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findById(
    id: string,
  ): Promise<
    Result<ServiceGroup | null, ServiceGroupNotFoundError | InfrastructureError>
  > {
    try {
      const row = await this.db
        .selectFrom('service_groups')
        .selectAll()
        .where('id', '=', id)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      if (!row) return ok(null);

      return ok(this.mapper.persistenceToDomain(row));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find service group by id',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findAllByBusiness(
    businessId: string,
  ): Promise<Result<ServiceGroup[], InfrastructureError>> {
    try {
      const rows = await this.db
        .selectFrom('service_groups')
        .selectAll()
        .where('business_id', '=', businessId)
        .where('is_deleted', '=', false)
        .execute();

      return ok(rows.map((row) => this.mapper.persistenceToDomain(row)));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find service groups by business',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async update(
    group: ServiceGroup,
  ): Promise<Result<void, ServiceGroupNotFoundError | InfrastructureError>> {
    try {
      const result = await this.db
        .updateTable('service_groups')
        .set(this.mapper.domainToPersistence(group))
        .where('id', '=', group.id)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      if (!result.numUpdatedRows || result.numUpdatedRows === BigInt(0)) {
        return err<ServiceGroupNotFoundError>({
          kind: 'service_group_not_found',
          by: 'id',
          value: group.id,
          message: `Service group not found against ${group.id}`,
          timestamp: new Date(),
        });
      }

      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to update service group',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async delete(
    id: string,
  ): Promise<Result<void, ServiceGroupNotFoundError | InfrastructureError>> {
    try {
      const result = await this.db
        .deleteFrom('service_groups')
        .where('id', '=', id)
        .executeTakeFirst();

      if (!result.numDeletedRows || result.numDeletedRows === BigInt(0)) {
        return err<ServiceGroupNotFoundError>({
          kind: 'service_group_not_found',
          by: 'id',
          value: id,
          message: `Service group not found against ${id}`,
          timestamp: new Date(),
        });
      }

      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to delete service group',
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
        .selectFrom('service_groups')
        .select('id')
        .where('name', '=', name)
        .where('business_id', '=', businessId)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      return ok(row !== undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to check service group existence by name',
        timestamp: new Date(),
        cause,
      });
    }
  }
}
