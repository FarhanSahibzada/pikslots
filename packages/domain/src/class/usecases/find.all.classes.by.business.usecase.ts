import type { InfrastructureError, Result } from '../../shared';
import type { Class } from '../class.entity';

export const IFindAllClassesByBusinessUseCase = Symbol('IFindAllClassesByBusinessUseCase');

export interface FindAllClassesByBusinessUseCase {
  execute(businessId: string): Promise<Result<Class[], InfrastructureError>>;
}
