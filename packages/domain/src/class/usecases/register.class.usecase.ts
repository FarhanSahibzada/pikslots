import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { Class } from '../class.entity';

export interface RegisterClassCommand {
  title: string;
  description: string;
  imagesUrls: string[];
  durationInMins: number;
  seats: number;
  cost: number;
  isHiddenFromBookingPage: boolean;
  associatedClassGroupIds: string[];
  businessId: string;
  createdBy: string;
}

export const IRegisterClassUseCase = Symbol('IRegisterClassUseCase');

export interface RegisterClassUseCase {
  execute(
    command: RegisterClassCommand,
  ): Promise<Result<Class, UnauthorizedError | InfrastructureError>>;
}
