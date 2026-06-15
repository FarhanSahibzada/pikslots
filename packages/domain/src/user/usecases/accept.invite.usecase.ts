import type { InfrastructureError, Result } from '../../shared';
import type { InviteAlreadyAcceptedError, InvalidOtpError, UserNotFoundError } from '../errors';

export interface AcceptInviteCommand {
  userId: string;
  businessId: string;
  otp: string;
  newPassword: string;
}

export const IAcceptInviteUseCase = Symbol('IAcceptInviteUseCase');

export interface AcceptInviteUseCase {
  execute(
    command: AcceptInviteCommand,
  ): Promise<
    Result<
      { message: 'success' },
      UserNotFoundError | InviteAlreadyAcceptedError | InvalidOtpError | InfrastructureError
    >
  >;
}
