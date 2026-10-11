import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { BookingConflictError } from '../../booking/errors';
import type { Booking } from '../../booking/booking.entity';
import type { CustomerAlreadyExistsError, CustomerNotFoundError } from '../../customer';
import type { ServiceNotFoundError } from '../../service';

/** Contact details collected from the public booking flow. */
export interface PublicBookingContactInput {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  customFields?: Record<string, string>;
}

export interface RegisterPublicBookingCommand {
  bookingDate: string;
  bookingStartTime: string;
  bookingEndTime: string;
  businessId: string;
  serviceId: string;
  /** Assigned team member. */
  userId: string;
  contact: PublicBookingContactInput;
  termsAccepted?: boolean;
}

export type RegisterPublicBookingError =
  | BookingConflictError
  | ServiceNotFoundError
  | CustomerAlreadyExistsError
  | CustomerNotFoundError
  | UnauthorizedError
  | InfrastructureError;

export const IRegisterPublicBookingUseCase = Symbol('IRegisterPublicBookingUseCase');

export interface RegisterPublicBookingUseCase {
  execute(
    command: RegisterPublicBookingCommand,
  ): Promise<Result<Booking, RegisterPublicBookingError>>;
}
