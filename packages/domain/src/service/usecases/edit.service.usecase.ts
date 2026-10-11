import type { InfrastructureError, Result, UnauthorizedError, ValidationError } from '../../shared';
import type { ServiceNotFoundError } from '../errors';

export interface EditServiceCommand {
  id: string;
  title: string;
  description: string;
  serviceAvatar: string;
  durationInMins: number;
  bufferTimeInMins: number;
  cost: number;
  isHiddenFromBookingPage: boolean;
  businessId: string;
  colorCode: string;
  associatedServiceGroups: string[];
  associatedUsers: string[];
  updatedBy: string;
}

export const IEditServiceUseCase = Symbol('IEditServiceUseCase');

export interface EditServiceUseCase {
  execute(
    command: EditServiceCommand,
  ): Promise<
    Result<void, ServiceNotFoundError | UnauthorizedError | InfrastructureError | ValidationError>
  >;
}
