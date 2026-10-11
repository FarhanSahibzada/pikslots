import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  ok,
  Customer,
  CustomerAlreadyExistsError,
  CustomerNotFoundError,
  CustomerRepository,
  InfrastructureError,
  Result,
  FullName,
} from '@pikslots/domain';
import { Kysely } from 'kysely';
import { PIKSLOTS_DB } from 'src/shared/database/pikslots.database.module';
import { PikSlotsDatabase } from 'src/shared/database/schema';
import { CustomerPersistenceMapper } from '../mappers/customer.database.mapper';

function hasPgErrorCode(cause: unknown): cause is { code: string } {
  return (
    typeof cause === 'object' &&
    cause !== null &&
    'code' in cause &&
    typeof cause.code === 'string'
  );
}

@Injectable()
export class CustomerRepositoryImpl implements CustomerRepository {
  private readonly mapper = new CustomerPersistenceMapper();

  constructor(
    @Inject(PIKSLOTS_DB) private readonly db: Kysely<PikSlotsDatabase>,
  ) {}

  async findCustomerListByBusiness(businessId: string): Promise<
    Result<
      {
        id: string;
        fullName: FullName;
        profileImageUrl: string | null;
        email: string | null;
      }[],
      InfrastructureError
    >
  > {
    try {
      const rows = await this.db
        .selectFrom('customers')
        .select(['id', 'first_name', 'last_name', 'email', 'profile_image_url'])
        .where('business_id', '=', businessId)
        .where('is_deleted', '=', false)
        .execute();

      return ok(
        rows.map((row) => {
          return {
            id: row.id,
            fullName: { firstName: row.first_name, lastName: row.last_name },
            email: row.email,
            profileImageUrl: row.profile_image_url,
          };
        }),
      );
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find customers by business',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async debounceCustomerSearchByBusiness(
    businessId: string,
    searchString: string,
  ): Promise<
    Result<
      | {
          id: string;
          fullName: FullName;
          profileImageUrl: string | null;
          email: string | null;
        }[]
      | null,
      InfrastructureError
    >
  > {
    try {
      const customers = await this.db
        .selectFrom('customers')
        .select(['id', 'first_name', 'last_name', 'email', 'profile_image_url'])
        .where('business_id', '=', businessId)
        .where('is_deleted', '=', false)
        .where((eb) =>
          eb.or([
            eb('first_name', 'ilike', `${searchString}%`),
            eb('email', 'ilike', `${searchString}%`),
            eb('primary_phone', 'ilike', `${searchString}%`),
          ]),
        )
        .limit(10)
        .execute();

      if (customers.length > 0) {
        return ok(
          customers.map((customer) => ({
            id: customer.id,
            fullName: {
              firstName: customer.first_name,
              lastName: customer.last_name,
            },
            email: customer.email,
            profileImageUrl: customer.profile_image_url,
          })),
        );
      }

      return ok(null);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'failed to get customers',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async save(
    customer: Customer,
  ): Promise<Result<void, CustomerAlreadyExistsError | InfrastructureError>> {
    try {
      await this.db
        .insertInto('customers')
        .values(this.mapper.domainToPersistence(customer))
        .execute();
      return ok(undefined);
    } catch (cause) {
      // unique constraint violation (email + business_id)
      if (hasPgErrorCode(cause) && cause.code === '23505') {
        return err<CustomerAlreadyExistsError>({
          kind: 'customer_already_exists',
          message: `A customer with this email already exists for this business`,
          timestamp: new Date(),
          email: customer.email ?? '',
          businessId: customer.businessId,
        });
      }
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to save customer',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findById(
    id: string,
  ): Promise<
    Result<Customer | null, CustomerNotFoundError | InfrastructureError>
  > {
    try {
      const row = await this.db
        .selectFrom('customers')
        .selectAll()
        .where('id', '=', id)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      if (!row) return ok(null);

      return ok(this.mapper.persistenceToDomain(row));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find customer by id',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findAllByBusiness(
    businessId: string,
  ): Promise<Result<Customer[], InfrastructureError>> {
    try {
      const rows = await this.db
        .selectFrom('customers')
        .selectAll()
        .where('business_id', '=', businessId)
        .where('is_deleted', '=', false)
        .execute();

      return ok(rows.map((row) => this.mapper.persistenceToDomain(row)));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find customers by business',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async update(
    customer: Customer,
  ): Promise<Result<void, CustomerNotFoundError | InfrastructureError>> {
    try {
      const result = await this.db
        .updateTable('customers')
        .set(this.mapper.domainToPersistence(customer))
        .where('id', '=', customer.id)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      if (!result.numUpdatedRows || result.numUpdatedRows === BigInt(0)) {
        return err<CustomerNotFoundError>({
          kind: 'customer_not_found',
          by: 'id',
          value: customer.id,
          message: `Customer not found against ${customer.id}`,
          timestamp: new Date(),
        });
      }

      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to update customer',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async delete(
    id: string,
  ): Promise<Result<void, CustomerNotFoundError | InfrastructureError>> {
    try {
      const result = await this.db
        .deleteFrom('customers')
        .where('id', '=', id)
        .executeTakeFirst();

      if (!result.numDeletedRows || result.numDeletedRows === BigInt(0)) {
        return err<CustomerNotFoundError>({
          kind: 'customer_not_found',
          by: 'id',
          value: id,
          message: `Customer not found against ${id}`,
          timestamp: new Date(),
        });
      }

      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to delete customer',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async existsByEmail(
    email: string,
    businessId: string,
  ): Promise<Result<boolean, InfrastructureError>> {
    try {
      const row = await this.db
        .selectFrom('customers')
        .select('id')
        .where('email', '=', email)
        .where('business_id', '=', businessId)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      return ok(row !== undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to check customer existence by email',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findByEmailOrName(
    email: string | null,
    fullName: { firstName: string; lastName: string },
    businessId: string,
  ): Promise<Result<Customer | null, InfrastructureError>> {
    try {
      const firstName = fullName.firstName;
      const lastName = fullName.lastName;
      const emailExist = email ? true : false;

      if (emailExist) {
        const row = await this.db
          .selectFrom('customers')
          .selectAll()
          .where((eb) =>
            eb.and([
              eb('email', '=', email),
              eb('first_name', '=', firstName),
              eb('last_name', '=', lastName),
            ]),
          )
          .where('business_id', '=', businessId)
          .where('is_deleted', '=', false)
          .executeTakeFirst();

        return ok(row ? this.mapper.persistenceToDomain(row) : null);
      } else {
        const row = await this.db
          .selectFrom('customers')
          .selectAll()
          .where((eb) =>
            eb.and([
              eb('first_name', '=', firstName),
              eb('last_name', '=', lastName),
            ]),
          )
          .where('business_id', '=', businessId)
          .where('is_deleted', '=', false)
          .executeTakeFirst();

        return ok(row ? this.mapper.persistenceToDomain(row) : null);
      }
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find customer by email',
        timestamp: new Date(),
        cause,
      });
    }
  }
}
