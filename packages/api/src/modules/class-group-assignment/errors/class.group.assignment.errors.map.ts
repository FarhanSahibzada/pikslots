import { HttpStatus } from '@nestjs/common';
import {
  type ClassGroupAssignmentAlreadyExistsError,
  type ClassGroupAssignmentNotFoundError,
  type InfrastructureError,
} from '@pikslots/domain';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';

type ClassGroupAssignmentError =
  | ClassGroupAssignmentAlreadyExistsError
  | ClassGroupAssignmentNotFoundError
  | InfrastructureError;

const classGroupAssignmentErrorMap: Record<
  ClassGroupAssignmentError['kind'],
  (error: ClassGroupAssignmentError) => PikslotsBaseErrorResponse
> = {
  class_group_assignment_already_exists: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.CONFLICT),
  class_group_assignment_not_found: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.NOT_FOUND),
  infrastructure: () =>
    new PikslotsBaseErrorResponse(
      'Something went wrong. Please try again later.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    ),
};

export function mapClassGroupAssignmentError(
  error: ClassGroupAssignmentError,
): PikslotsBaseErrorResponse {
  console.log(error);
  return classGroupAssignmentErrorMap[error.kind](error);
}
