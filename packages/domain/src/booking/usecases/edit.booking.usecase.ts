import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { BookingNotFoundError, BookingConflictError } from '../errors';
import type { Booking } from '../booking.entity';

export interface EditBookingUseCaseCommand {
  bookingId: string;
  bookingDate: string;
  bookingStartTime: string; /** ISO 8601 UTC datetime string */
  bookingEndTime: string; /** ISO 8601 UTC datetime string */
  serviceId: string;
  customerId: string;
  userId: string;
  updatedBy: string;
  label?: string | null;
  notes?: string | null;
}

export const IEditBookingUseCase = Symbol('IEditBookingUseCase');

export interface EditBookingUseCase {
  execute(
    command: EditBookingUseCaseCommand,
  ): Promise<
    Result<
      Booking,
      BookingNotFoundError | BookingConflictError | UnauthorizedError | InfrastructureError
    >
  >;
}
