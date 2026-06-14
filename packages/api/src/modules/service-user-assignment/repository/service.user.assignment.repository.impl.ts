import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  ok,
  InfrastructureError,
  Result,
  ServiceUserAssignment,
  ServiceUserAssignmentRepository,
  UserSummary,
  ServiceSummary,
} from '@pikslots/domain';
import { Kysely } from 'kysely';
import { PIKSLOTS_DB } from 'src/shared/database/pikslots.database.module';
import { PikSlotsDatabase } from 'src/shared/database/schema';
import { ServiceUserAssignmentPersistenceMapper } from '../mappers/service.user.assignment.database.mapper';

@Injectable()
export class ServiceUserAssignmentRepositoryImpl implements ServiceUserAssignmentRepository {
  private readonly mapper = new ServiceUserAssignmentPersistenceMapper();

  constructor(
    @Inject(PIKSLOTS_DB) private readonly db: Kysely<PikSlotsDatabase>,
  ) {}

  async save(
    assignment: ServiceUserAssignment,
  ): Promise<Result<void, InfrastructureError>> {
    try {
      await this.db
        .insertInto('service_user_assignments')
        .values(this.mapper.domainToPersistence(assignment))
        .execute();
      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to save service user assignment',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async saveAll(
    assignments: ServiceUserAssignment[],
  ): Promise<Result<void, InfrastructureError>> {
    if (assignments.length === 0) return ok(undefined);
    try {
      await this.db
        .insertInto('service_user_assignments')
        .values(assignments.map((a) => this.mapper.domainToPersistence(a)))
        .execute();
      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to save service user assignments',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findById(
    id: string,
  ): Promise<Result<ServiceUserAssignment | null, InfrastructureError>> {
    try {
      const row = await this.db
        .selectFrom('service_user_assignments')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst();

      if (!row) return ok(null);

      return ok(this.mapper.persistenceToDomain(row));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find service user assignment by id',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findAllByService(
    serviceId: string,
  ): Promise<Result<ServiceUserAssignment[], InfrastructureError>> {
    try {
      const rows = await this.db
        .selectFrom('service_user_assignments')
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

  async findAllByUser(
    userId: string,
  ): Promise<Result<ServiceUserAssignment[], InfrastructureError>> {
    try {
      const rows = await this.db
        .selectFrom('service_user_assignments')
        .selectAll()
        .where('user_id', '=', userId)
        .execute();

      return ok(rows.map((row) => this.mapper.persistenceToDomain(row)));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find assignments by user',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findAllByBusiness(
    businessId: string,
  ): Promise<Result<ServiceUserAssignment[], InfrastructureError>> {
    try {
      const rows = await this.db
        .selectFrom('service_user_assignments')
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

  async findByServiceAndUser(
    serviceId: string,
    userId: string,
  ): Promise<Result<ServiceUserAssignment | null, InfrastructureError>> {
    try {
      const row = await this.db
        .selectFrom('service_user_assignments')
        .selectAll()
        .where('service_id', '=', serviceId)
        .where('user_id', '=', userId)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      if (!row) return ok(null);

      return ok(this.mapper.persistenceToDomain(row));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find assignment by service and user',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async existsByServiceAndUser(
    serviceId: string,
    userId: string,
  ): Promise<Result<boolean, InfrastructureError>> {
    try {
      const row = await this.db
        .selectFrom('service_user_assignments')
        .select('id')
        .where('service_id', '=', serviceId)
        .where('user_id', '=', userId)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      return ok(row !== undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to check service user assignment existence',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findUsersByService(
    serviceId: string,
  ): Promise<Result<UserSummary[], InfrastructureError>> {
    try {
      const rows = await this.db
        .selectFrom('service_user_assignments as sua')
        .innerJoin('users as u', 'u.id', 'sua.user_id')
        .select(['u.id', 'u.first_name', 'u.last_name'])
        .where('sua.service_id', '=', serviceId)
        .where('sua.is_deleted', '=', false)
        .execute();

      return ok(rows.map((r) => ({ id: r.id, firstName: r.first_name, lastName: r.last_name })));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find users by service',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findServicesByUser(
    userId: string,
  ): Promise<Result<ServiceSummary[], InfrastructureError>> {
    try {
      const rows = await this.db
        .selectFrom('service_user_assignments as sua')
        .innerJoin('services as s', 's.id', 'sua.service_id')
        .select(['s.id', 's.title'])
        .where('sua.user_id', '=', userId)
        .where('sua.is_deleted', '=', false)
        .execute();

      return ok(rows.map((r) => ({ id: r.id, title: r.title })));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find services by user',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async update(
    assignment: ServiceUserAssignment,
  ): Promise<Result<void, InfrastructureError>> {
    try {
      await this.db
        .updateTable('service_user_assignments')
        .set(this.mapper.domainToPersistence(assignment))
        .where('id', '=', assignment.id)
        .execute();

      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to update service user assignment',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async deleteById(id: string): Promise<Result<void, InfrastructureError>> {
    try {
      await this.db
        .deleteFrom('service_user_assignments')
        .where('id', '=', id)
        .execute();

      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to delete service user assignment',
        timestamp: new Date(),
        cause,
      });
    }
  }
}
