import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type {
  BusinessInactiveError,
  BusinessNotFoundError,
  BusinessSuspendedError,
} from '../errors';
import type { Business } from '../business.entity';

export const IFindBusinessByIdUseCase = Symbol('IFindBusinessByIdUseCase');

export interface FindBusinessByIdUseCase {
  execute(
    businessId: string,
  ): Promise<
    Result<
      Business,
      | BusinessNotFoundError
      | InfrastructureError
      | UnauthorizedError
      | BusinessSuspendedError
      | BusinessInactiveError
    >
  >;
}
