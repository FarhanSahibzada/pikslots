import { Inject, Injectable } from '@nestjs/common';
import {
  BookingNotFoundError,
  type BookingRepository,
  err,
  FindBookingByIdCommand,
  FindBookingByIdUseCase,
  IBookingRepository,
  InfrastructureError,
  ok,
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
export class FindBookingByIdUseCaseImpl implements FindBookingByIdUseCase {
  constructor(
    @Inject(IBookingRepository)
    private readonly bookingRepository: BookingRepository,
    private readonly securityContext: SecurityContext,
  ) {}

  async execute(
    command: FindBookingByIdCommand,
  ): Promise<
    Result<
      BookingProps,
      BookingNotFoundError | UnauthorizedError | InfrastructureError
    >
  > {
    const found = await this.bookingRepository.findById(command.bookingId);
    if (!found.ok) return err(found.error);

    if (!found.value) {
      return err<BookingNotFoundError>({
        kind: 'booking_not_found',
        by: 'id',
        value: command.bookingId,
        message: `Booking not found by id: ${command.bookingId}`,
        timestamp: new Date(),
      });
    }

    const isPartOfSameBusiness =
      this.securityContext.businessId === found.value.businessId;

    if (!isPartOfSameBusiness) return err(UNAUTHORIZED_ERROR);

    return ok(found.value.toProps());
  }
}
