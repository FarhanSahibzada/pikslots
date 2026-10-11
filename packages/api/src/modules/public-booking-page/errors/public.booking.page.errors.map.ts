import { HttpStatus } from '@nestjs/common';
import {
  type PublicBookingPageDetailsNotFound,
  type RegisterPublicBookingError,
} from '@pikslots/domain';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';

type PublicBookingPageError =
  | PublicBookingPageDetailsNotFound
  | RegisterPublicBookingError;

const errorMap: Record<
  PublicBookingPageError['kind'],
  (error: PublicBookingPageError) => PikslotsBaseErrorResponse
> = {
  booking_page_not_found: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.NOT_FOUND),
  booking_conflict: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.CONFLICT),
  service_not_found: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.NOT_FOUND),
  customer_already_exists: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.CONFLICT),
  customer_not_found: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.NOT_FOUND),
  unauthorized: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.UNAUTHORIZED),
  infrastructure: () => {
    return new PikslotsBaseErrorResponse(
      'Something went wrong. Please try again later.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  },
};

export function mapPublicBookingPageError(
  error: PublicBookingPageError,
): PikslotsBaseErrorResponse {
  return errorMap[error.kind](error);
}
