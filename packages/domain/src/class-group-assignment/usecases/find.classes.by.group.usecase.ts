import type { ClassSummary, InfrastructureError, Result } from '../../shared';

export const IFindClassesByGroupUseCase = Symbol('IFindClassesByGroupUseCase');

export interface FindClassesByGroupUseCase {
  execute(classGroupId: string): Promise<Result<ClassSummary[], InfrastructureError>>;
}
