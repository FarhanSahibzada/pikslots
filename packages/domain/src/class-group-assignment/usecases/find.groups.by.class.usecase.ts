import type { InfrastructureError, Result } from '../../shared';
import type { ClassGroupSummary } from '../read-models';

export const IFindGroupsByClassUseCase = Symbol('IFindGroupsByClassUseCase');

export interface FindGroupsByClassUseCase {
  execute(classId: string): Promise<Result<ClassGroupSummary[], InfrastructureError>>;
}
