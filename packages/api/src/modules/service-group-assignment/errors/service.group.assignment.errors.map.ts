import { HttpStatus } from '@nestjs/common';
import {
  type InfrastructureError,
  type ServiceGroupAssigmentAlreadyExistsError,
  type ServiceGroupAssignmentNotFoundError,
} from '@pikslots/domain';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';

type ServiceGroupAssignmentError =
  | ServiceGroupAssigmentAlreadyExistsError
  | ServiceGroupAssignmentNotFoundError
  | InfrastructureError;

const serviceGroupAssignmentErrorMap: Record<
  ServiceGroupAssignmentError['kind'],
  (error: ServiceGroupAssignmentError) => PikslotsBaseErrorResponse
> = {
  service_group_assignment_already_exists: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.CONFLICT),
  service_group_assignment_not_found: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.NOT_FOUND),
  infrastructure: (error) =>
    new PikslotsBaseErrorResponse(
      'Something went wrong. Please try again later.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    ),
};

export function mapServiceGroupAssignmentError(
  error: ServiceGroupAssignmentError,
): PikslotsBaseErrorResponse {
  console.log(error);
  return serviceGroupAssignmentErrorMap[error.kind](error);
}
