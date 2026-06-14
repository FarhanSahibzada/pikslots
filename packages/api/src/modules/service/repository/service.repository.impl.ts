import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  ok,
  InfrastructureError,
  Result,
  Service,
  ServiceNotFoundError,
  ServiceRepository,
} from '@pikslots/domain';
import { Kysely } from 'kysely';
import { PIKSLOTS_DB } from 'src/shared/database/pikslots.database.module';
import { PikSlotsDatabase } from 'src/shared/database/schema';
import { ServicePersistenceMapper } from '../mappers/service.database.mapper';

@Injectable()
export class ServiceRepositoryImpl implements ServiceRepository {
  private readonly mapper = new ServicePersistenceMapper();

  constructor(
    @Inject(PIKSLOTS_DB) private readonly db: Kysely<PikSlotsDatabase>,
  ) {}

  async save(service: Service): Promise<Result<void, InfrastructureError>> {
    try {
      await this.db
        .insertInto('services')
        .values(this.mapper.domainToPersistence(service))
        .execute();
      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to save service',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findById(
    id: string,
  ): Promise<
    Result<Service | null, ServiceNotFoundError | InfrastructureError>
  > {
    try {
      const row = await this.db
        .selectFrom('services')
        .selectAll()
        .where('id', '=', id)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      if (!row) return ok(null);

      return ok(this.mapper.persistenceToDomain(row));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find service by id',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findAllByBusiness(
    businessId: string,
  ): Promise<Result<Service[], InfrastructureError>> {
    try {
      const rows = await this.db
        .selectFrom('services')
        .selectAll()
        .where('business_id', '=', businessId)
        .where('is_deleted', '=', false)
        .execute();

      return ok(rows.map((row) => this.mapper.persistenceToDomain(row)));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find services by business',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async update(
    service: Service,
  ): Promise<Result<void, ServiceNotFoundError | InfrastructureError>> {
    try {
      const result = await this.db
        .updateTable('services')
        .set(this.mapper.domainToPersistence(service))
        .where('id', '=', service.id)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      if (!result.numUpdatedRows || result.numUpdatedRows === BigInt(0)) {
        return err<ServiceNotFoundError>({
          kind: 'service_not_found',
          by: 'id',
          value: service.id,
          message: `Service not found against ${service.id}`,
          timestamp: new Date(),
        });
      }

      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to update service',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async delete(
    id: string,
  ): Promise<Result<void, ServiceNotFoundError | InfrastructureError>> {
    try {
      const result = await this.db
        .deleteFrom('services')
        .where('id', '=', id)
        .executeTakeFirst();

      if (!result.numDeletedRows || result.numDeletedRows === BigInt(0)) {
        return err<ServiceNotFoundError>({
          kind: 'service_not_found',
          by: 'id',
          value: id,
          message: `Service not found against ${id}`,
          timestamp: new Date(),
        });
      }

      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to delete service',
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
        .selectFrom('services')
        .select('id')
        .where('title', '=', title)
        .where('business_id', '=', businessId)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      return ok(row !== undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to check service existence by title',
        timestamp: new Date(),
        cause,
      });
    }
  }
}
