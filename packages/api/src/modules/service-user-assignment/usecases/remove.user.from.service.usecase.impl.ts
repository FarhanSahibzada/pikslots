import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  ok,
  InfrastructureError,
  IServiceUserAssignmentRepository,
  Result,
  ServiceUserAssignmentNotFoundError,
  RemoveUserFromServiceCommand,
  RemoveUserFromServiceUseCase,
} from '@pikslots/domain';
import type { ServiceUserAssignmentRepository } from '@pikslots/domain';

@Injectable()
export class RemoveUserFromServiceUseCaseImpl implements RemoveUserFromServiceUseCase {
  constructor(
    @Inject(IServiceUserAssignmentRepository)
    private readonly assignmentRepository: ServiceUserAssignmentRepository,
  ) {}

  async execute(
    command: RemoveUserFromServiceCommand,
  ): Promise<
    Result<void, ServiceUserAssignmentNotFoundError | InfrastructureError>
  > {
    const found = await this.assignmentRepository.findByServiceAndUser(
      command.serviceId,
      command.userId,
    );

    if (!found.ok) return err(found.error);

    if (!found.value) {
      return err<ServiceUserAssignmentNotFoundError>({
        kind: 'service_user_assignment_not_found',
        serviceId: command.serviceId,
        userId: command.userId,
        message: `User '${command.userId}' is not assigned to service '${command.serviceId}'`,
        timestamp: new Date(),
      });
    }

    const softDeleted = found.value.softDelete(command.deletedBy);

    const updated = await this.assignmentRepository.update(softDeleted);
    if (!updated.ok) return err(updated.error);

    return ok(undefined);
  }
}
