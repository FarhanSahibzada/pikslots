import { Inject, Injectable } from '@nestjs/common';
import {
  Business,
  IBusinessRepository,
  InfrastructureError,
  Result,
  err,
  ok,
} from '@pikslots/domain';
import type {
  BusinessInactiveError,
  BusinessNotFoundError,
  BusinessRepository,
  BusinessSuspendedError,
  FindBusinessByIdUseCase,
  UnauthorizedError,
} from '@pikslots/domain';
import { SecurityContext } from 'src/shared/security/context/security.context';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'can not access business data',
  timestamp: new Date(),
};

@Injectable()
export class FindBusinessByIdUseCaseImpl implements FindBusinessByIdUseCase {
  constructor(
    @Inject(IBusinessRepository)
    private readonly businessRepository: BusinessRepository,
    private readonly securityContext: SecurityContext,
  ) {}

  async execute(
    businessId: string,
  ): Promise<
    Result<
      Business,
      | BusinessNotFoundError
      | InfrastructureError
      | UnauthorizedError
      | BusinessSuspendedError
      | BusinessInactiveError
    >
  > {
    if (this.securityContext.role === 'No Access')
      return err(UNAUTHORIZED_ERROR);

    const result = await this.businessRepository.findById(businessId);

    if (!result.ok) return err(result.error as InfrastructureError);

    const business = result.value;

    if (!business) {
      return err<BusinessNotFoundError>({
        kind: 'business_not_found',
        by: 'id',
        value: businessId,
        message: `Business not found: ${businessId}`,
        timestamp: new Date(),
      });
    }

    if (business.status === 'suspended') {
      return err<BusinessSuspendedError>({
        kind: 'business_suspended',
        reason: business.suspendedReason,
        message: 'This business has been suspended.',
        timestamp: new Date(),
      });
    }

    if (business.status === 'inactive') {
      return err<BusinessInactiveError>({
        kind: 'business_inactive',
        status: business.status,
        message: 'This business is not currently active.',
        timestamp: new Date(),
      });
    }

    return ok(business);
  }
}
