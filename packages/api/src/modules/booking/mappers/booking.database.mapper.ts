import { Booking } from '@pikslots/domain';
import {
  domainAuditToPersistence,
  persistenceAuditToDomain,
} from 'src/shared/database/mapper/audit.fields.mapper';
import {
  BookingTableInsert,
  BookingTableSelect,
} from 'src/shared/database/schema/booking.table';

export class BookingPersistenceMapper {
  public persistenceToDomain(row: BookingTableSelect): Booking {
    return Booking.reconstitute({
      id: row.id,
      bookingId: row.booking_id,
      bookingDate: row.booking_date.toISOString(),
      bookingStartTime: row.booking_start_time.toISOString(),
      bookingEndTime: row.booking_end_time.toISOString(),
      businessId: row.business_id,
      serviceId: row.service_id,
      customerId: row.customer_id,
      userId: row.user_id,
      serviceSnapshot: row.service_snapshot,
      ...persistenceAuditToDomain(row),
    });
  }

  public domainToPersistence(booking: Booking): BookingTableInsert {
    return {
      id: booking.id,
      booking_id: booking.bookingId,
      booking_date: new Date(booking.bookingDate),
      booking_start_time: new Date(booking.bookingStartTime),
      booking_end_time: new Date(booking.bookingEndTime),
      business_id: booking.businessId,
      service_id: booking.serviceId,
      customer_id: booking.customerId,
      user_id: booking.userId,
      service_snapshot: booking.serviceSnapshot,
      ...domainAuditToPersistence(booking),
    };
  }
}
