import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { BookingProps } from '../booking.entity';

export const IFindAllBookingsByBusinessForUserUseCase = Symbol(
  'IFindAllBookingsByBusinessForUserUseCase',
);

export interface FindAllBookingsByBusinessForUserUseCase {
  execute(
    businessId: string,
    userId: string,
    startDateTime: string,
    endDateTime: string,
    timezone: string,
  ): Promise<
    Result<
      Pick<
        BookingProps,
        | 'id'
        | 'bookingId'
        | 'bookingDate'
        | 'bookingStartTime'
        | 'bookingEndTime'
        | 'userId'
        | 'serviceSnapshot'
        | 'serviceId'
        | 'customerId'
        | 'label'
        | 'notes'
      >[],
      UnauthorizedError | InfrastructureError
    >
  >;
}
