import { Inject, Injectable } from '@nestjs/common';
import {
  type BookingRepository,
  err,
  FindAllBookingsByBusinessUseCase,
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
export class FindAllBookingsByBusinessUseCaseImpl implements FindAllBookingsByBusinessUseCase {
  constructor(
    @Inject(IBookingRepository)
    private readonly bookingRepository: BookingRepository,
    private readonly securityContext: SecurityContext,
  ) {}

  async execute(
    businessId: string,
  ): Promise<
    Result<
      Pick<
        BookingProps,
        | 'id'
        | 'bookingId'
        | 'bookingDate'
        | 'bookingStartTime'
        | 'bookingEndTime'
        | 'serviceSnapshot'
        | 'serviceId'
        | 'customerId'
      >[],
      UnauthorizedError | InfrastructureError
    >
  > {
    const isPartOfSameBusiness = this.securityContext.businessId === businessId;

    if (!isPartOfSameBusiness) return err(UNAUTHORIZED_ERROR);

    return this.bookingRepository.findAllByBusiness(businessId);
  }
}
