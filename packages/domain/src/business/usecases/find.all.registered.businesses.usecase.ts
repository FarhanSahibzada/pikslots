import type { InfrastructureError, Result } from '../../shared';
import type { Business } from '../business.entity';

export const IFindAllRegisteredBusinessesUseCase = Symbol('IFindAllRegisteredBusinessesUseCase');

// only accessed by super admin role
export interface FindAllRegisteredBusinessesUseCase {
  execute(): Promise<Result<Business[], InfrastructureError>>;
}
