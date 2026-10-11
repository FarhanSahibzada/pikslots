import type { InfrastructureError, Result, UnauthorizedError, ValidationError } from '../../shared';
import type { Service } from '../service.entity';

export interface RegisterServiceCommand {
  title: string;
  description: string;
  serviceAvatar: string;
  durationInMins: number;
  bufferTimeInMins: number;
  cost: number;
  isHiddenFromBookingPage: boolean;
  colorCode: string;
  businessId: string;
  createdBy: string;
  associatedServiceGroups: string[];
  associatedUsers: string[];
}

export const IRegisterServiceUseCase = Symbol('IRegisterServiceUseCase');

export interface RegisterServiceUseCase {
  execute(
    command: RegisterServiceCommand,
  ): Promise<Result<Service, UnauthorizedError | InfrastructureError | ValidationError>>;
}
