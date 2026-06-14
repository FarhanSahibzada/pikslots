import type { InfrastructureError, Result, ServiceSummary } from '../../shared';

export const IFindServicesByUserUseCase = Symbol('IFindServicesByUserUseCase');

export interface FindServicesByUserUseCase {
  execute(userId: string): Promise<Result<ServiceSummary[], InfrastructureError>>;
}
