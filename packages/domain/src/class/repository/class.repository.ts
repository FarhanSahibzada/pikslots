import type { Result } from '../../shared/result';
import type { InfrastructureError } from '../../shared';
import type { ClassNotFoundError } from '../errors';
import type { Class } from '../class.entity';

export interface ClassRepository {
  save(cls: Class): Promise<Result<void, InfrastructureError>>;
  findById(id: string): Promise<Result<Class | null, ClassNotFoundError | InfrastructureError>>;
  findAllByBusiness(businessId: string): Promise<Result<Class[], InfrastructureError>>;
  update(cls: Class): Promise<Result<void, ClassNotFoundError | InfrastructureError>>;
  existsByTitle(title: string, businessId: string): Promise<Result<boolean, InfrastructureError>>;
  delete(id: string): Promise<Result<void, ClassNotFoundError | InfrastructureError>>;
}

export const IClassRepository = Symbol('IClassRepository');
