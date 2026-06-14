import type { InfrastructureError, Result } from '../../shared';
import type { ServiceGroupSummary } from '../read-models';

export const IFindGroupsByServiceUseCase = Symbol('IFindGroupsByServiceUseCase');

export interface FindGroupsByServiceUseCase {
  execute(serviceId: string): Promise<Result<ServiceGroupSummary[], InfrastructureError>>;
}
