import { Inject, Injectable } from '@nestjs/common';
import { workingHourToUTC } from '@pikslots/datetime';
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
    const isStandard = callerRole === 'Standard';

    if (!Booking.canViewBookings(callerRole, isPartOfSameBusiness, isSelf))
      return err(UNAUTHORIZED_ERROR);

    const startUtc = workingHourToUTC(
      startDateTime.slice(0, 10),
      '00:00',
      timezone,
    );
    const endUtc = workingHourToUTC(
      endDateTime.slice(0, 10),
      '00:00',
      timezone,
    );

    const bookingFound = isStandard
      ? await this.bookingRepository.findAllByBusinessForUser(
          businessId,
          userId,
          startUtc,
          endUtc,
        )
      : await this.bookingRepository.findAllByBusiness(
          businessId,
          startUtc,
          endUtc,
        );

    if (!bookingFound.ok) return err(bookingFound.error);

    return ok(
      bookingFound.value.map((b) => ({
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
