import { HttpStatus } from '@nestjs/common';
import type {
  InfrastructureError,
  ServiceNotFoundError,
  UnauthorizedError,
  ValidationError,
} from '@pikslots/domain';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';

type ServiceError =
  | ServiceNotFoundError
  | UnauthorizedError
  | InfrastructureError
  | ValidationError;

const serviceErrorMap: Record<
  ServiceError['kind'],
  (error: ServiceError) => PikslotsBaseErrorResponse
> = {
  service_not_found: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.NOT_FOUND),
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

export function mapServiceError(
  error: ServiceError,
): PikslotsBaseErrorResponse {
  return serviceErrorMap[error.kind](error);
}
