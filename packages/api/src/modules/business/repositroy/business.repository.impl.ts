import { Inject, Injectable } from '@nestjs/common';
import {
  Business,
  BusinessAlreadyExistsError,
  BusinessNotFoundError,
  BusinessRepository,
  InfrastructureError,
  Result,
  err,
  ok,
} from '@pikslots/domain';
import { Kysely } from 'kysely';
import { PIKSLOTS_DB } from 'src/shared/database/pikslots.database.module';
import {
  isUniqueViolation,
  getUniqueViolationField,
} from 'src/shared/database/helpers';
import { PikSlotsDatabase } from 'src/shared/database/schema';
import { BusinessPersistenceMapper } from '../mappers/business.database.mapper';

@Injectable()
export class BusinessRepositoryImpl implements BusinessRepository {
  private readonly mapper = new BusinessPersistenceMapper();

  constructor(
    @Inject(PIKSLOTS_DB) private readonly db: Kysely<PikSlotsDatabase>,
  ) {}

  async save(
    business: Business,
  ): Promise<Result<void, BusinessAlreadyExistsError | InfrastructureError>> {
    try {
      await this.db
        .insertInto('businesses')
        .values(this.mapper.domainToPersistence(business))
        .execute();
      return ok(undefined);
    } catch (cause) {
      if (isUniqueViolation(cause)) {
        const field = getUniqueViolationField(cause) as 'slug' | 'email';
        return err<BusinessAlreadyExistsError>({
          kind: 'business_already_exists',
          message: `A business with this ${field} already exists`,
          timestamp: new Date(),
          field,
        });
      }

      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to save business',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findById(
    id: string,
  ): Promise<
    Result<Business | null, BusinessNotFoundError | InfrastructureError>
  > {
    try {
      const row = await this.db
        .selectFrom('businesses')
        .selectAll()
        .where('id', '=', id)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      if (!row) return ok(null);

      return ok(this.mapper.persistenceToDomain(row));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find business by id',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findBySlug(
    slug: string,
  ): Promise<
    Result<Business | null, BusinessNotFoundError | InfrastructureError>
  > {
    try {
      const row = await this.db
        .selectFrom('businesses')
        .selectAll()
        .where('slug', '=', slug)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      if (!row) return ok(null);

      return ok(this.mapper.persistenceToDomain(row));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find business by slug',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findByOwnerId(
    ownerId: string,
  ): Promise<
    Result<Business | null, BusinessNotFoundError | InfrastructureError>
  > {
    try {
      const row = await this.db
        .selectFrom('businesses')
        .selectAll()
        .where('owner_id', '=', ownerId)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      if (!row) return ok(null);

      return ok(this.mapper.persistenceToDomain(row));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find business by owner id',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async update(
    business: Business,
  ): Promise<
    Result<
      void,
      BusinessNotFoundError | BusinessAlreadyExistsError | InfrastructureError
    >
  > {
    try {
      const { id, owner_id, ...fields } =
        this.mapper.domainToPersistence(business);

      const result = await this.db
        .updateTable('businesses')
        .set(fields)
        .where('id', '=', business.id)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      if (result.numUpdatedRows === BigInt(0)) {
        return err<BusinessNotFoundError>({
          kind: 'business_not_found',
          message: `Business not found: ${business.id}`,
          timestamp: new Date(),
          by: 'id',
          value: business.id,
        });
      }

      return ok(undefined);
    } catch (cause) {
      if (isUniqueViolation(cause)) {
        const field = getUniqueViolationField(cause) as 'slug' | 'email';
        return err<BusinessAlreadyExistsError>({
          kind: 'business_already_exists',
          message: `A business with this ${field} already exists`,
          timestamp: new Date(),
          field,
        });
      }

      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to update business',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async existsBySlug(
    slug: string,
  ): Promise<Result<boolean, InfrastructureError>> {
    try {
      const row = await this.db
        .selectFrom('businesses')
        .select('id')
        .where('slug', '=', slug)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      return ok(row !== undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to check business existence by slug',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findAll(): Promise<Result<Business[], InfrastructureError>> {
    try {
      const rows = await this.db
        .selectFrom('businesses')
        .selectAll()
        .where('is_deleted', '=', false)
        .execute();

      return ok(rows.map((row) => this.mapper.persistenceToDomain(row)));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to fetch all businesses',
        timestamp: new Date(),
        cause,
      });
    }
  }
}
