import { HttpStatus } from '@nestjs/common';
import type {
  InfrastructureError,
  InviterNotAuthorizedError,
  RoleQueryNotAuthorizedError,
  UnauthorizedError,
  UserAlreadyExistsError,
  UserNotFoundError,
  UserSuspendedError,
  UserInactiveError,
  ValidationError,
} from '@pikslots/domain';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';

type UserError =
  | UserAlreadyExistsError
  | InviterNotAuthorizedError
  | RoleQueryNotAuthorizedError
  | UnauthorizedError
  | UserNotFoundError
  | UserInactiveError
  | UserSuspendedError
  | InfrastructureError
  | ValidationError;

const userErrorMap: Record<
  UserError['kind'],
  (error: UserError) => PikslotsBaseErrorResponse
> = {
  user_already_exists: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.CONFLICT),
  inviter_not_authorized: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.FORBIDDEN),
  role_query_not_authorized: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.FORBIDDEN),
  user_not_found: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.NOT_FOUND),
  user_suspended: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.FORBIDDEN),
  user_inactive: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.FORBIDDEN),
  unauthorized: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.UNAUTHORIZED),
  validation: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.BAD_REQUEST),
  infrastructure: () =>
    new PikslotsBaseErrorResponse(
      'Something went wrong. Please try again later.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    ),
};

export function mapUserError(error: UserError): PikslotsBaseErrorResponse {
  return userErrorMap[error.kind](error);
}
