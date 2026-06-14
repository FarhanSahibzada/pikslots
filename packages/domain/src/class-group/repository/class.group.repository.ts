import type { Result } from '../../shared/result';
import type { InfrastructureError } from '../../shared';
import type {
  ClassGroupAlreadyExistsInBusinessError,
  ClassGroupNotFoundError,
} from '../errors';
import type { ClassGroup } from '../class.group.entity';

export interface ClassGroupRepository {
  save(
    group: ClassGroup,
  ): Promise<Result<void, ClassGroupAlreadyExistsInBusinessError | InfrastructureError>>;
  findById(
    id: string,
  ): Promise<Result<ClassGroup | null, ClassGroupNotFoundError | InfrastructureError>>;
  findAllByBusiness(businessId: string): Promise<Result<ClassGroup[], InfrastructureError>>;
  update(
    group: ClassGroup,
  ): Promise<Result<void, ClassGroupNotFoundError | InfrastructureError>>;
  existsByName(name: string, businessId: string): Promise<Result<boolean, InfrastructureError>>;
  delete(id: string): Promise<Result<void, ClassGroupNotFoundError | InfrastructureError>>;
}

export const IClassGroupRepository = Symbol('IClassGroupRepository');
