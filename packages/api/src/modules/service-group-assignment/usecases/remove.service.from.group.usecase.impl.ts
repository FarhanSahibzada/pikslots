import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  ok,
  InfrastructureError,
  IServiceGroupAssignmentRepository,
  Result,
  ServiceGroupAssignmentNotFoundError,
  RemoveServiceFromGroupCommand,
  RemoveServiceFromGroupUseCase,
} from '@pikslots/domain';
import type { ServiceGroupAssignmentRepository } from '@pikslots/domain';

@Injectable()
export class RemoveServiceFromGroupUseCaseImpl implements RemoveServiceFromGroupUseCase {
  constructor(
    @Inject(IServiceGroupAssignmentRepository)
    private readonly assignmentRepository: ServiceGroupAssignmentRepository,
  ) {}

  async execute(
    command: RemoveServiceFromGroupCommand,
  ): Promise<
    Result<void, ServiceGroupAssignmentNotFoundError | InfrastructureError>
  > {
    const found = await this.assignmentRepository.findByServiceAndGroup(
      command.serviceId,
      command.serviceGroupId,
    );

    if (!found.ok) return err(found.error);

    if (!found.value) {
      return err<ServiceGroupAssignmentNotFoundError>({
        kind: 'service_group_assignment_not_found',
        serviceId: command.serviceId,
        serviceGroupId: command.serviceGroupId,
        message: `Service '${command.serviceId}' is not assigned to group '${command.serviceGroupId}'`,
        timestamp: new Date(),
      });
    }

    const softDeleted = found.value.softDelete(command.deletedBy);

    const updated = await this.assignmentRepository.update(softDeleted);
    if (!updated.ok) return err(updated.error);

    return ok(undefined);
  }
}
