import { HttpStatus } from '@nestjs/common';
import { InfrastructureError, UnauthorizedError } from '@pikslots/domain';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';

type AuditLogError = UnauthorizedError | InfrastructureError;

const auditLogErrorMap: Record<
  AuditLogError['kind'],
  (error: AuditLogError) => PikslotsBaseErrorResponse
> = {
  unauthorized: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.UNAUTHORIZED),
  infrastructure: () =>
    new PikslotsBaseErrorResponse(
      'Something went wrong. Please try again later.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    ),
};

export function mapAuditLogError(
  error: AuditLogError,
): PikslotsBaseErrorResponse {
  console.log(error);
  return auditLogErrorMap[error.kind](error);
}
