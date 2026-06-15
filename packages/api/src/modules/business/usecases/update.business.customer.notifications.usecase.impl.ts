import { Inject, Injectable } from '@nestjs/common';
import {
  Business,
  IBusinessRepository,
  InfrastructureError,
  Result,
  err,
  ok,
} from '@pikslots/domain';
import type {
  BusinessNotFoundError,
  BusinessRepository,
  UpdateBusinessCustomerNotificationsCommand,
  UpdateBusinessCustomerNotificationsUseCase,
} from '@pikslots/domain';
import { SecurityContext } from 'src/shared/security/context/security.context';

const BUSINESS_NOT_FOUND = (id: string): BusinessNotFoundError => ({
  kind: 'business_not_found',
  by: 'id',
  value: id,
  message: `Business not found against ${id}`,
  timestamp: new Date(),
});

@Injectable()
export class UpdateBusinessCustomerNotificationsUseCaseImpl implements UpdateBusinessCustomerNotificationsUseCase {
  constructor(
    @Inject(IBusinessRepository)
    private readonly businessRepository: BusinessRepository,
    private readonly securityContext: SecurityContext,
  ) {}

  async execute(
    command: UpdateBusinessCustomerNotificationsCommand,
  ): Promise<Result<Business, BusinessNotFoundError | InfrastructureError>> {
    const findResult = await this.businessRepository.findById(command.id);
    if (!findResult.ok) return err(findResult.error as InfrastructureError);

    const business = findResult.value;
    if (!business) return err(BUSINESS_NOT_FOUND(command.id));

    const updated = business.updateCustomerNotifications({
      notifyBookingConfirmation: command.notifyBookingConfirmation,
      notifyBookingChanges: command.notifyBookingChanges,
      notifyBookingCancellations: command.notifyBookingCancellations,
      bookingRemindersTime: command.bookingRemindersTime,
      updatedBy: this.securityContext.userId,
    });

    const updateResult = await this.businessRepository.update(updated);
    if (!updateResult.ok)
      return err(
        updateResult.error as BusinessNotFoundError | InfrastructureError,
      );

    return ok(updated);
  }
}
