import type { InfrastructureError, Result } from '../../shared';
import type { ServiceGroup } from '../service.group.entity';

export const IFindAllServiceGroupsByBusinessUseCase = Symbol(
  'IFindAllServiceGroupsByBusinessUseCase',
);

export interface FindAllServiceGroupsByBusinessUseCase {
  execute(businessId: string): Promise<Result<ServiceGroup[], InfrastructureError>>;
}
