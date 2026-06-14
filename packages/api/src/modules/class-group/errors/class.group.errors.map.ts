import { HttpStatus } from '@nestjs/common';
import {
  type ClassGroupAlreadyExistsInBusinessError,
  type ClassGroupNotFoundError,
  type InfrastructureError,
} from '@pikslots/domain';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';

type ClassGroupError =
  | ClassGroupAlreadyExistsInBusinessError
  | ClassGroupNotFoundError
  | InfrastructureError;

const classGroupErrorMap: Record<
  ClassGroupError['kind'],
  (error: ClassGroupError) => PikslotsBaseErrorResponse
> = {
  class_group_already_exists: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.CONFLICT),
  class_group_not_found: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.NOT_FOUND),
  infrastructure: () =>
    new PikslotsBaseErrorResponse(
      'Something went wrong. Please try again later.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    ),
};

export function mapClassGroupError(
  error: ClassGroupError,
): PikslotsBaseErrorResponse {
  console.log(error);
  return classGroupErrorMap[error.kind](error);
}
