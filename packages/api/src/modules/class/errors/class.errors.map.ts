import { HttpStatus } from '@nestjs/common';
import type {
  ClassNotFoundError,
  InfrastructureError,
  UnauthorizedError,
} from '@pikslots/domain';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';

type ClassError = ClassNotFoundError | UnauthorizedError | InfrastructureError;

const classErrorMap: Record<
  ClassError['kind'],
  (error: ClassError) => PikslotsBaseErrorResponse
> = {
  class_not_found: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.NOT_FOUND),
  unauthorized: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.UNAUTHORIZED),
  infrastructure: () =>
    new PikslotsBaseErrorResponse(
      'Something went wrong. Please try again later.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    ),
};

export function mapClassError(error: ClassError): PikslotsBaseErrorResponse {
  console.log(error);
  return classErrorMap[error.kind](error);
}
