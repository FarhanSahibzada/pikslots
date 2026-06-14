import type { InfrastructureError, Result } from '../../shared';
import type { ClassGroup } from '../class.group.entity';

export const IFindAllClassGroupsByBusinessUseCase = Symbol(
  'IFindAllClassGroupsByBusinessUseCase',
);

export interface FindAllClassGroupsByBusinessUseCase {
  execute(businessId: string): Promise<Result<ClassGroup[], InfrastructureError>>;
}
