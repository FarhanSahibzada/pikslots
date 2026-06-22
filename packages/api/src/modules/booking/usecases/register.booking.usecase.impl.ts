import { Inject, Injectable } from '@nestjs/common';
import {
  Booking,
  BookingConflictError,
  type BookingRepository,
  err,
  IBookingRepository,
  InfrastructureError,
  ok,
  RegisterBookingCommand,
  RegisterBookingUseCase,
  Result,
  UnauthorizedError,
} from '@pikslots/domain';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { v7 as uuidv7 } from 'uuid';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'Cannot create booking: unauthorized',
  timestamp: new Date(),
};

@Injectable()
export class RegisterBookingUseCaseImpl implements RegisterBookingUseCase {
  constructor(
    @Inject(IBookingRepository)
    private readonly bookingRepository: BookingRepository,
    private readonly securityContext: SecurityContext,
  ) {}

  async execute(
    command: RegisterBookingCommand,
  ): Promise<
    Result<
      Booking,
      BookingConflictError | UnauthorizedError | InfrastructureError
    >
  > {
    const callerBusinessId = this.securityContext.businessId;
    const callerUserId = this.securityContext.userId;
    const callerRole = this.securityContext.role;
    const isPartOfSameBusiness = callerBusinessId === command.businessId;
    const isSelf = callerUserId === command.userId; // booking for self

    if (Booking.canRegisterBooking(callerRole, isPartOfSameBusiness, isSelf))
      return err(UNAUTHORIZED_ERROR);

    const conflict = await this.bookingRepository.hasConflict(
      command.businessId,
      command.bookingStartTime,
      command.bookingEndTime,
    );

    if (!conflict.ok) return err(conflict.error);

    if (conflict.value) {
      return err<BookingConflictError>({
        kind: 'booking_conflict',
        message: 'A booking already exists for this time slot',
        timestamp: new Date(),
        startTime: command.bookingStartTime,
        endTime: command.bookingEndTime,
      });
    }

    const id = uuidv7();
    const bookingId = `BK-${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;

    const booking = Booking.create({
      id,
      bookingId,
      bookingDate: command.bookingDate,
      bookingStartTime: command.bookingStartTime,
      bookingEndTime: command.bookingEndTime,
      businessId: command.businessId,
      serviceId: command.serviceId,
      userId: this.securityContext.userId,
      serviceSnapshot: command.serviceSnapshot,
      customerId: command.customerId,
      createdBy: command.createdBy,
    });

    const saved = await this.bookingRepository.save(booking);
    if (!saved.ok) return err(saved.error);

    return ok(booking);
  }
}
