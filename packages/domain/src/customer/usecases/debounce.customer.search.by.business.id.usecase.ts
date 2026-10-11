import type { FullName, InfrastructureError, Result } from '../../shared';

export const IDebounceCustomerSearchByBusinessIdUseCase = Symbol(
  'DebounceCustomerSearchByBusinessIdUseCase',
);

export interface DebounceCustomerSearchByBusinessIdUseCase {
  execute(
    businessId: string,
    searchString: string,
  ): Promise<
    Result<
      { id: string; fullName: FullName; profileImageUrl: string | null; email: string | null }[],
      InfrastructureError
    >
  >;
}
