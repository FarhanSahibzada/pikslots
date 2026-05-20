import type { Result } from '../../shared/result';
import type { InfrastructureError } from '../../shared';
import type { BusinessAlreadyExistsError, BusinessNotFoundError } from '../errors';
import type { Business } from '../business.entity';

export interface BusinessRepository {
  save(business: Business): Promise<Result<void, BusinessAlreadyExistsError | InfrastructureError>>;
  findById(id: string): Promise<Result<Business | null, BusinessNotFoundError | InfrastructureError>>;
  findBySlug(slug: string): Promise<Result<Business | null, BusinessNotFoundError | InfrastructureError>>;
  findByOwnerId(ownerId: string): Promise<Result<Business | null, BusinessNotFoundError | InfrastructureError>>;
  existsBySlug(slug: string): Promise<Result<boolean, InfrastructureError>>;
  existsByEmail(email: string): Promise<Result<boolean, InfrastructureError>>;
  findAll(): Promise<Result<Business[], InfrastructureError>>;
}

export const IBusinessRepository = Symbol('IBusinessRepository');
