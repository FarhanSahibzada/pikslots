import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { ServiceNotFoundError } from '../errors';

export interface EditServiceCommand {
  id: string;
  title: string;
  description: string;
  imagesUrls: string[];
  durationInMins: number;
  bufferTimeInMins: number;
  cost: number;
  isHiddenFromBookingPage: boolean;
  businessId: string;
  associatedServiceGroups: string[];
  associatedUsers: string[];
  updatedBy: string;
}

export const IEditServiceUseCase = Symbol('IEditServiceUseCase');

export interface EditServiceUseCase {
  execute(
    command: EditServiceCommand,
  ): Promise<Result<void, ServiceNotFoundError | UnauthorizedError | InfrastructureError>>;
}
