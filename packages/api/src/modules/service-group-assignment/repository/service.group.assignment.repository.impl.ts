import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  ok,
  InfrastructureError,
  Result,
  ServiceGroupAssignment,
  ServiceGroupAssignmentRepository,
} from '@pikslots/domain';
import { Kysely } from 'kysely';
import { PIKSLOTS_DB } from 'src/shared/database/pikslots.database.module';
import { PikSlotsDatabase } from 'src/shared/database/schema';
import { ServiceGroupAssignmentPersistenceMapper } from '../mappers/service.group.assignment.database.mapper';

@Injectable()
export class ServiceGroupAssignmentRepositoryImpl implements ServiceGroupAssignmentRepository {
  private readonly mapper = new ServiceGroupAssignmentPersistenceMapper();

  constructor(
    @Inject(PIKSLOTS_DB) private readonly db: Kysely<PikSlotsDatabase>,
  ) {}

  async save(
    assignment: ServiceGroupAssignment,
  ): Promise<Result<void, InfrastructureError>> {
    try {
      await this.db
        .insertInto('service_group_assignments')
        .values(this.mapper.domainToPersistence(assignment))
        .execute();
      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to save service group assignment',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findById(
    id: string,
  ): Promise<Result<ServiceGroupAssignment | null, InfrastructureError>> {
    try {
      const row = await this.db
        .selectFrom('service_group_assignments')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst();

      if (!row) return ok(null);

      return ok(this.mapper.persistenceToDomain(row));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find service group assignment by id',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findAllByServiceGroup(
    serviceGroupId: string,
  ): Promise<Result<ServiceGroupAssignment[], InfrastructureError>> {
    try {
      const rows = await this.db
        .selectFrom('service_group_assignments')
        .selectAll()
        .where('service_group_id', '=', serviceGroupId)
        .execute();

      return ok(rows.map((row) => this.mapper.persistenceToDomain(row)));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find assignments by service group',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findAllByService(
    serviceId: string,
  ): Promise<Result<ServiceGroupAssignment[], InfrastructureError>> {
    try {
      const rows = await this.db
        .selectFrom('service_group_assignments')
        .selectAll()
        .where('service_id', '=', serviceId)
        .execute();

      return ok(rows.map((row) => this.mapper.persistenceToDomain(row)));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find assignments by service',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findAllByBusiness(
    businessId: string,
  ): Promise<Result<ServiceGroupAssignment[], InfrastructureError>> {
    try {
      const rows = await this.db
        .selectFrom('service_group_assignments')
        .selectAll()
        .where('business_id', '=', businessId)
        .execute();

      return ok(rows.map((row) => this.mapper.persistenceToDomain(row)));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find assignments by business',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findByServiceAndGroup(
    serviceId: string,
    serviceGroupId: string,
  ): Promise<Result<ServiceGroupAssignment | null, InfrastructureError>> {
    try {
      const row = await this.db
        .selectFrom('service_group_assignments')
        .selectAll()
        .where('service_id', '=', serviceId)
        .where('service_group_id', '=', serviceGroupId)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      if (!row) return ok(null);

      return ok(this.mapper.persistenceToDomain(row));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find assignment by service and group',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async existsByServiceAndGroup(
    serviceId: string,
    serviceGroupId: string,
  ): Promise<Result<boolean, InfrastructureError>> {
    try {
      const row = await this.db
        .selectFrom('service_group_assignments')
        .select('id')
        .where('service_id', '=', serviceId)
        .where('service_group_id', '=', serviceGroupId)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      return ok(row !== undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to check assignment existence',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async update(
    assignment: ServiceGroupAssignment,
  ): Promise<Result<void, InfrastructureError>> {
    try {
      await this.db
        .updateTable('service_group_assignments')
        .set(this.mapper.domainToPersistence(assignment))
        .where('id', '=', assignment.id)
        .execute();

      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to update service group assignment',
        timestamp: new Date(),
        cause,
      });
    }
  }
}
