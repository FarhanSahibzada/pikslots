import { HttpStatus } from '@nestjs/common';
import {
  type InfrastructureError,
  type ServiceGroupAlreadyExistsInBusinessError,
  type ServiceGroupNotFoundError,
} from '@pikslots/domain';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';

type ServiceGroupError =
  | ServiceGroupAlreadyExistsInBusinessError
  | ServiceGroupNotFoundError
  | InfrastructureError;

const serviceGroupErrorMap: Record<
  ServiceGroupError['kind'],
  (error: ServiceGroupError) => PikslotsBaseErrorResponse
> = {
  service_group_already_exists: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.CONFLICT),
  service_group_not_found: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.NOT_FOUND),
  infrastructure: (error) =>
    new PikslotsBaseErrorResponse(
      'Something went wrong. Please try again later.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    ),
};

export function mapServiceGroupError(
  error: ServiceGroupError,
): PikslotsBaseErrorResponse {
  console.log(error);
  return serviceGroupErrorMap[error.kind](error);
}
