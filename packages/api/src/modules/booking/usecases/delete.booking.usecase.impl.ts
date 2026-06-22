import { Inject, Injectable } from '@nestjs/common';
import {
  BookingNotFoundError,
  type BookingRepository,
  DeleteBookingCommand,
  DeleteBookingUseCase,
  err,
  IBookingRepository,
  InfrastructureError,
  ok,
  Result,
  UnauthorizedError,
} from '@pikslots/domain';
import { SecurityContext } from 'src/shared/security/context/security.context';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'Cannot delete booking: unauthorized',
  timestamp: new Date(),
};

@Injectable()
export class DeleteBookingUseCaseImpl implements DeleteBookingUseCase {
  constructor(
    @Inject(IBookingRepository)
    private readonly bookingRepository: BookingRepository,
    private readonly securityContext: SecurityContext,
  ) {}

  async execute(
    command: DeleteBookingCommand,
  ): Promise<
    Result<void, BookingNotFoundError | UnauthorizedError | InfrastructureError>
  > {
    const found = await this.bookingRepository.findById(command.id);
    if (!found.ok) return err(found.error);

    if (!found.value) {
      return err<BookingNotFoundError>({
        kind: 'booking_not_found',
        by: 'id',
        value: command.id,
        message: `Booking not found by id: ${command.id}`,
        timestamp: new Date(),
      });
    }

    const isPartOfSameBusiness =
      this.securityContext.businessId === found.value.businessId;

    if (!isPartOfSameBusiness) return err(UNAUTHORIZED_ERROR);

    const softDeleted = found.value.softDelete(command.deletedBy);

    const saved = await this.bookingRepository.update(softDeleted);
    if (!saved.ok) return err(saved.error);

    return ok(undefined);
  }
}
