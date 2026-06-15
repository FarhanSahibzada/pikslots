import { Inject, Injectable } from '@nestjs/common';
import {
  ClassGroupAssignment,
  ClassGroupAssignmentRepository,
  ClassGroupSummary,
  ClassSummary,
  err,
  IClassGroupAssignmentRepository,
  InfrastructureError,
  ok,
  Result,
} from '@pikslots/domain';
import { Kysely } from 'kysely';
import { PIKSLOTS_DB } from 'src/shared/database/pikslots.database.module';
import { PikSlotsDatabase } from 'src/shared/database/schema';
import { ClassGroupAssignmentPersistenceMapper } from '../mappers/class.group.assignment.database.mapper';

@Injectable()
export class ClassGroupAssignmentRepositoryImpl implements ClassGroupAssignmentRepository {
  private readonly mapper = new ClassGroupAssignmentPersistenceMapper();

  constructor(
    @Inject(PIKSLOTS_DB) private readonly db: Kysely<PikSlotsDatabase>,
  ) {}

  async save(
    assignment: ClassGroupAssignment,
  ): Promise<Result<void, InfrastructureError>> {
    try {
      await this.db
        .insertInto('class_group_assignments')
        .values(this.mapper.domainToPersistence(assignment))
        .execute();
      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to save class group assignment',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async saveAll(
    assignments: ClassGroupAssignment[],
  ): Promise<Result<void, InfrastructureError>> {
    if (assignments.length === 0) return ok(undefined);
    try {
      await this.db
        .insertInto('class_group_assignments')
        .values(assignments.map((a) => this.mapper.domainToPersistence(a)))
        .execute();
      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to save class group assignments',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findById(
    id: string,
  ): Promise<Result<ClassGroupAssignment | null, InfrastructureError>> {
    try {
      const row = await this.db
        .selectFrom('class_group_assignments')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst();

      if (!row) return ok(null);

      return ok(this.mapper.persistenceToDomain(row));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find class group assignment by id',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findAllByClassGroup(
    classGroupId: string,
  ): Promise<Result<ClassGroupAssignment[], InfrastructureError>> {
    try {
      const rows = await this.db
        .selectFrom('class_group_assignments')
        .selectAll()
        .where('class_group_id', '=', classGroupId)
        .execute();

      return ok(rows.map((row) => this.mapper.persistenceToDomain(row)));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find assignments by class group',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findAllByClass(
    classId: string,
  ): Promise<Result<ClassGroupAssignment[], InfrastructureError>> {
    try {
      const rows = await this.db
        .selectFrom('class_group_assignments')
        .selectAll()
        .where('class_id', '=', classId)
        .execute();

      return ok(rows.map((row) => this.mapper.persistenceToDomain(row)));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find assignments by class',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findAllByBusiness(
    businessId: string,
  ): Promise<Result<ClassGroupAssignment[], InfrastructureError>> {
    try {
      const rows = await this.db
        .selectFrom('class_group_assignments')
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

  async findByClassAndGroup(
    classId: string,
    classGroupId: string,
  ): Promise<Result<ClassGroupAssignment | null, InfrastructureError>> {
    try {
      const row = await this.db
        .selectFrom('class_group_assignments')
        .selectAll()
        .where('class_id', '=', classId)
        .where('class_group_id', '=', classGroupId)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      if (!row) return ok(null);

      return ok(this.mapper.persistenceToDomain(row));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find assignment by class and group',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async existsByClassAndGroup(
    classId: string,
    classGroupId: string,
  ): Promise<Result<boolean, InfrastructureError>> {
    try {
      const row = await this.db
        .selectFrom('class_group_assignments')
        .select('id')
        .where('class_id', '=', classId)
        .where('class_group_id', '=', classGroupId)
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

  async findGroupsByClass(
    classId: string,
  ): Promise<Result<ClassGroupSummary[], InfrastructureError>> {
    try {
      const rows = await this.db
        .selectFrom('class_group_assignments as cga')
        .innerJoin('class_groups as cg', 'cg.id', 'cga.class_group_id')
        .select(['cg.id', 'cg.name'])
        .where('cga.class_id', '=', classId)
        .where('cga.is_deleted', '=', false)
        .execute();

      return ok(rows.map((r) => ({ id: r.id, name: r.name })));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find groups by class',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findClassesByGroup(
    classGroupId: string,
  ): Promise<Result<ClassSummary[], InfrastructureError>> {
    try {
      const rows = await this.db
        .selectFrom('class_group_assignments as cga')
        .innerJoin('classes as c', 'c.id', 'cga.class_id')
        .select(['c.id', 'c.title'])
        .where('cga.class_group_id', '=', classGroupId)
        .where('cga.is_deleted', '=', false)
        .execute();

      return ok(rows.map((r) => ({ id: r.id, title: r.title })));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find classes by group',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async update(
    assignment: ClassGroupAssignment,
  ): Promise<Result<void, InfrastructureError>> {
    try {
      await this.db
        .updateTable('class_group_assignments')
        .set(this.mapper.domainToPersistence(assignment))
        .where('id', '=', assignment.id)
        .execute();

      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to update class group assignment',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async deleteById(id: string): Promise<Result<void, InfrastructureError>> {
    try {
      await this.db
        .deleteFrom('class_group_assignments')
        .where('id', '=', id)
        .execute();

      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to delete class group assignment',
        timestamp: new Date(),
        cause,
      });
    }
  }
}
