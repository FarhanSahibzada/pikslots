import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { ClassNotFoundError } from '../errors';

export interface EditClassCommand {
  id: string;
  title: string;
  description: string;
  imagesUrls: string[];
  durationInMins: number;
  seats: number;
  cost: number;
  isHiddenFromBookingPage: boolean;
  associatedClassGroupIds: string[];
  businessId: string;
  updatedBy: string;
}

export const IEditClassUseCase = Symbol('IEditClassUseCase');

export interface EditClassUseCase {
  execute(
    command: EditClassCommand,
  ): Promise<Result<void, ClassNotFoundError | UnauthorizedError | InfrastructureError>>;
}
