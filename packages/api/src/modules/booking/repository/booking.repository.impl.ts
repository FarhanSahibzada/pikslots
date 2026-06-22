import { Inject, Injectable } from '@nestjs/common';
import {
  Booking,
  BookingConflictError,
  BookingNotFoundError,
  BookingRepository,
  err,
  InfrastructureError,
  ok,
  Result,
} from '@pikslots/domain';
import type { BookingProps } from '@pikslots/domain';
import { sql, Kysely } from 'kysely';
import { PIKSLOTS_DB } from 'src/shared/database/pikslots.database.module';
import { PikSlotsDatabase } from 'src/shared/database/schema';
import { BookingPersistenceMapper } from '../mappers/booking.database.mapper';

@Injectable()
export class BookingRepositoryImpl implements BookingRepository {
  private readonly mapper = new BookingPersistenceMapper();

  constructor(
    @Inject(PIKSLOTS_DB) private readonly db: Kysely<PikSlotsDatabase>,
  ) {}

  async save(
    booking: Booking,
  ): Promise<Result<void, BookingConflictError | InfrastructureError>> {
    try {
      await this.db
        .insertInto('bookings')
        .values(this.mapper.domainToPersistence(booking))
        .execute();
      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to save booking',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findById(
    id: string,
  ): Promise<Result<Booking | null, InfrastructureError>> {
    try {
      const row = await this.db
        .selectFrom('bookings')
        .selectAll()
        .where('id', '=', id)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      if (!row) return ok(null);

      return ok(this.mapper.persistenceToDomain(row));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find booking by id',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findAllByBusiness(
    businessId: string,
  ): Promise<
    Result<
      Pick<
        BookingProps,
        | 'id'
        | 'bookingId'
        | 'bookingDate'
        | 'bookingStartTime'
        | 'bookingEndTime'
        | 'serviceSnapshot'
        | 'serviceId'
        | 'customerId'
      >[],
      InfrastructureError
    >
  > {
    try {
      const rows = await this.db
        .selectFrom('bookings')
        .select([
          'id',
          'booking_id',
          'booking_date',
          'booking_start_time',
          'booking_end_time',
          'service_snapshot',
          'service_id',
          'customer_id',
        ])
        .where('business_id', '=', businessId)
        .where('is_deleted', '=', false)
        .execute();

      return ok(
        rows.map((row) => ({
          id: row.id,
          bookingId: row.booking_id,
          bookingDate: row.booking_date.toISOString(),
          bookingStartTime: row.booking_start_time.toISOString(),
          bookingEndTime: row.booking_end_time.toISOString(),
          serviceSnapshot: row.service_snapshot,
          serviceId: row.service_id,
          customerId: row.customer_id,
        })),
      );
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find bookings by business',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async update(
    booking: Booking,
  ): Promise<Result<void, BookingNotFoundError | InfrastructureError>> {
    try {
      const result = await this.db
        .updateTable('bookings')
        .set(this.mapper.domainToPersistence(booking))
        .where('id', '=', booking.id)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      if (!result.numUpdatedRows || result.numUpdatedRows === BigInt(0)) {
        return err<BookingNotFoundError>({
          kind: 'booking_not_found',
          by: 'id',
          value: booking.id,
          message: `Booking not found for id: ${booking.id}`,
          timestamp: new Date(),
        });
      }

      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to update booking',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async delete(
    id: string,
  ): Promise<Result<void, BookingNotFoundError | InfrastructureError>> {
    try {
      const result = await this.db
        .deleteFrom('bookings')
        .where('id', '=', id)
        .executeTakeFirst();

      if (!result.numDeletedRows || result.numDeletedRows === BigInt(0)) {
        return err<BookingNotFoundError>({
          kind: 'booking_not_found',
          by: 'id',
          value: id,
          message: `Booking not found for id: ${id}`,
          timestamp: new Date(),
        });
      }

      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to delete booking',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async hasConflict(
    businessId: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string,
  ): Promise<Result<boolean, InfrastructureError>> {
    try {
      let query = this.db
        .selectFrom('bookings')
        .select('id')
        .where('business_id', '=', businessId)
        .where('is_deleted', '=', false)
        .where('booking_start_time', '<', new Date(endTime))
        .where('booking_end_time', '>', new Date(startTime));

      if (excludeBookingId) {
        query = query.where('id', '!=', excludeBookingId);
      }

      const row = await query.executeTakeFirst();
      return ok(row !== undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to check booking conflict',
        timestamp: new Date(),
        cause,
      });
    }
  }
}
