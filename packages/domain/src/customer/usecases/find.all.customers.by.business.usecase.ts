import type { FullName, InfrastructureError, Result, UnauthorizedError } from '../../shared';

export const IFindAllCustomersByBusinessUseCase = Symbol('IFindAllCustomersByBusinessUseCase');

export interface FindAllCustomersByBusinessUseCase {
  execute(
    businessId: string,
  ): Promise<
    Result<
      { id: string; fullName: FullName; profileImageUrl: string | null; email: string | null }[],
      UnauthorizedError | InfrastructureError
    >
  >;
}
