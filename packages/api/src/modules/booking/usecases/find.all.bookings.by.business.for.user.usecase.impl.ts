import { Inject, Injectable } from '@nestjs/common';
import { formatIsoInTimezone } from '@pikslots/datetime';
import {
  Booking,
  type BookingRepository,
  err,
  ok,
  FindAllBookingsByBusinessForUserUseCase,
  IBookingRepository,
  InfrastructureError,
  Result,
  UnauthorizedError,
} from '@pikslots/domain';
import type { BookingProps } from '@pikslots/domain';
import { SecurityContext } from 'src/shared/security/context/security.context';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'Access denied',
  timestamp: new Date(),
};

@Injectable()
export class FindAllBookingsByBusinessForUserUseCaseImpl implements FindAllBookingsByBusinessForUserUseCase {
  constructor(
    @Inject(IBookingRepository)
    private readonly bookingRepository: BookingRepository,
    private readonly securityContext: SecurityContext,
  ) {}

  async execute(
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
  > {
    const isPartOfSameBusiness = this.securityContext.businessId === businessId;
    const callerRole = this.securityContext.role;
    const isSelf = this.securityContext.userId === userId;

    if (!Booking.canViewBookings(callerRole, isPartOfSameBusiness, isSelf))
      return err(UNAUTHORIZED_ERROR);

    const bookingFound = await this.bookingRepository.findAllByBusinessForUser(
      businessId,
      userId,
    );

    if (!bookingFound.ok) return err(bookingFound.error);

    const startDate = `${startDateTime.slice(0, 10)}T00:00:00.000Z`;
    const endDate = `${endDateTime.slice(0, 10)}T00:00:00.000Z`;

    const givenStartDate = formatIsoInTimezone(
      startDate,
      timezone,
      'yyyy-MM-dd',
    );

    const givenEndDate = formatIsoInTimezone(endDate, timezone, 'yyyy-MM-dd');

    const filtered = bookingFound.value.filter(
      (b) =>
        b.bookingStartTime >= givenStartDate &&
        b.bookingEndTime <= givenEndDate,
    );

    return ok(
      filtered.map((b) => ({
        id: b.id,
        bookingId: b.bookingId,
        bookingDate: b.bookingDate,
        bookingStartTime: b.bookingStartTime,
        bookingEndTime: b.bookingEndTime,
        userId: b.userId,
        serviceSnapshot: b.serviceSnapshot,
        serviceId: b.serviceId,
        customerId: b.customerId,
        label: b.label,
        notes: b.notes,
      })),
    );
  }
}
