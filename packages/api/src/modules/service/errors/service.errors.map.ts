import { HttpStatus } from '@nestjs/common';
import type {
  InfrastructureError,
  ServiceNotFoundError,
  UnauthorizedError,
} from '@pikslots/domain';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';

type ServiceError =
  | ServiceNotFoundError
  | UnauthorizedError
  | InfrastructureError;

const serviceErrorMap: Record<
  ServiceError['kind'],
  (error: ServiceError) => PikslotsBaseErrorResponse
> = {
  service_not_found: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.NOT_FOUND),
  unauthorized: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.UNAUTHORIZED),
  infrastructure: () =>
    new PikslotsBaseErrorResponse(
      'Something went wrong. Please try again later.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    ),
};

export function mapServiceError(
  error: ServiceError,
): PikslotsBaseErrorResponse {
  console.log(error);
  return serviceErrorMap[error.kind](error);
}
