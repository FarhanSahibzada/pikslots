import type { InfrastructureError, Result, ServiceSummary } from '../../shared';

export const IFindServicesByGroupUseCase = Symbol('IFindServicesByGroupUseCase');

export interface FindServicesByGroupUseCase {
  execute(serviceGroupId: string): Promise<Result<ServiceSummary[], InfrastructureError>>;
}
