import { HttpStatus } from '@nestjs/common';
import type {
  CustomerAlreadyExistsError,
  CustomerNotFoundError,
  InfrastructureError,
  UnauthorizedError,
} from '@pikslots/domain';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';

type CustomerError =
  | CustomerNotFoundError
  | CustomerAlreadyExistsError
  | UnauthorizedError
  | InfrastructureError;

const customerErrorMap: Record<
  CustomerError['kind'],
  (error: CustomerError) => PikslotsBaseErrorResponse
> = {
  customer_not_found: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.NOT_FOUND),
  customer_already_exists: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.CONFLICT),
  unauthorized: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.UNAUTHORIZED),
  infrastructure: () =>
    new PikslotsBaseErrorResponse(
      'Something went wrong. Please try again later.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    ),
};

export function mapCustomerError(
  error: CustomerError,
): PikslotsBaseErrorResponse {
  console.log(error);
  return customerErrorMap[error.kind](error);
}
