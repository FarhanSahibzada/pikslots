import type { InfrastructureError, Result } from '../../shared';
import type { Service } from '../service.entity';

export const IFindAllServicesByBusinessUseCase = Symbol('IFindAllServicesByBusinessUseCase');

export interface FindAllServicesByBusinessUseCase {
  execute(businessId: string): Promise<Result<Service[], InfrastructureError>>;
}
