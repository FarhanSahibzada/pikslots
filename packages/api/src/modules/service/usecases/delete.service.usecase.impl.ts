import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  InfrastructureError,
  IServiceRepository,
  ok,
  Result,
  Service,
  ServiceNotFoundError,
} from '@pikslots/domain';
import type {
  DeleteServiceUseCase,
  ServiceRepository,
  UnauthorizedError,
} from '@pikslots/domain';
import { SecurityContext } from 'src/shared/security/context/security.context';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'Can not register service : unauthorized!!!',
  timestamp: new Date(),
};

const SERVICE_NOT_FOUND_ERROR: ServiceNotFoundError = {
  kind: 'service_not_found',
  by: 'id',
  message: 'Failed to find the service',
  value: 'Failed to find the service',
  timestamp: new Date(),
};

@Injectable()
export class DeleteServiceUseCaseImpl implements DeleteServiceUseCase {
  constructor(
    @Inject(IServiceRepository)
    private readonly serviceRepository: ServiceRepository,
    private readonly securityContext: SecurityContext,
  ) {}

  async execute(
    id: string,
  ): Promise<
    Result<void, ServiceNotFoundError | UnauthorizedError | InfrastructureError>
  > {
    const serviceFound = await this.serviceRepository.findById(id);

    if (!serviceFound.ok) return err(serviceFound.error);

    if (!serviceFound.value) return err(SERVICE_NOT_FOUND_ERROR);

    const callerRole = this.securityContext.role;
    const callerBusinessId = this.securityContext.businessId;
    const isPartOfSameBusiness =
      callerBusinessId === serviceFound.value.businessId;

    if (!Service.canDeleteService(callerRole, isPartOfSameBusiness))
      return err(UNAUTHORIZED_ERROR);

    const deleteServiceResult = await this.serviceRepository.delete(id);

    if (!deleteServiceResult.ok) return err(deleteServiceResult.error);

    return ok(deleteServiceResult.value);
  }
}
