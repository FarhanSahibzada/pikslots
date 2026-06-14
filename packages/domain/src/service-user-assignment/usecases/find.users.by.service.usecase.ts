import type { InfrastructureError, Result } from '../../shared';
import type { UserSummary } from '../read-models/user.summary';

export const IFindUsersByServiceUseCase = Symbol('IFindUsersByServiceUseCase');

export interface FindUsersByServiceUseCase {
  execute(serviceId: string): Promise<Result<UserSummary[], InfrastructureError>>;
}
