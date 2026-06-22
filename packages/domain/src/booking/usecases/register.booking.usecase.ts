import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { BookingConflictError } from '../errors';
import type { Booking, ServiceSnapshot } from '../booking.entity';

export interface RegisterBookingCommand {
  bookingDate: string;
  bookingStartTime: string;
  bookingEndTime: string;
  businessId: string;
  serviceId: string;
  userId: string;
  serviceSnapshot: ServiceSnapshot;
  customerId: string;
  createdBy: string;
}

export const IRegisterBookingUseCase = Symbol('IRegisterBookingUseCase');

export interface RegisterBookingUseCase {
  execute(
    command: RegisterBookingCommand,
  ): Promise<Result<Booking, BookingConflictError | UnauthorizedError | InfrastructureError>>;
}
