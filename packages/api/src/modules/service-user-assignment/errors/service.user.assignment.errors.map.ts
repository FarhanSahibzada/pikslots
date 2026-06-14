import { HttpStatus } from '@nestjs/common';
import {
  type InfrastructureError,
  type ServiceUserAssignmentAlreadyExistsError,
  type ServiceUserAssignmentNotFoundError,
} from '@pikslots/domain';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';

type ServiceUserAssignmentError =
  | ServiceUserAssignmentAlreadyExistsError
  | ServiceUserAssignmentNotFoundError
  | InfrastructureError;

const serviceUserAssignmentErrorMap: Record<
  ServiceUserAssignmentError['kind'],
  (error: ServiceUserAssignmentError) => PikslotsBaseErrorResponse
> = {
  service_user_assignment_already_exists: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.CONFLICT),
  service_user_assignment_not_found: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.NOT_FOUND),
  infrastructure: () =>
    new PikslotsBaseErrorResponse(
      'Something went wrong. Please try again later.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    ),
};

export function mapServiceUserAssignmentError(
  error: ServiceUserAssignmentError,
): PikslotsBaseErrorResponse {
  console.log(error);
  return serviceUserAssignmentErrorMap[error.kind](error);
}
