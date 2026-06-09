import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  ok,
  InfrastructureError,
  IServiceGroupAssignmentRepository,
  Result,
  ServiceGroupAssignment,
  ServiceGroupAssigmentAlreadyExistsError,
  AssignServiceToGroupCommand,
  AssignServiceToGroupUseCase,
} from '@pikslots/domain';
import { v7 as uuidv7 } from 'uuid';
import type { ServiceGroupAssignmentRepository } from '@pikslots/domain';

@Injectable()
export class AssignServiceToGroupUseCaseImpl implements AssignServiceToGroupUseCase {
  constructor(
    @Inject(IServiceGroupAssignmentRepository)
    private readonly assignmentRepository: ServiceGroupAssignmentRepository,
  ) {}

  async execute(
    command: AssignServiceToGroupCommand,
  ): Promise<
    Result<
      ServiceGroupAssignment,
      ServiceGroupAssigmentAlreadyExistsError | InfrastructureError
    >
  > {
    const exists = await this.assignmentRepository.existsByServiceAndGroup(
      command.serviceId,
      command.serviceGroupId,
    );

    if (!exists.ok) return err(exists.error);

    if (exists.value) {
      return err<ServiceGroupAssigmentAlreadyExistsError>({
        kind: 'service_group_assignment_already_exists',
        serviceId: command.serviceId,
        serviceGroupId: command.serviceGroupId,
        message: `Service '${command.serviceId}' is already assigned to group '${command.serviceGroupId}'`,
        timestamp: new Date(),
      });
    }

    const now = new Date();
    const assignment = ServiceGroupAssignment.create({
      id: uuidv7(),
      serviceId: command.serviceId,
      serviceGroupId: command.serviceGroupId,
      businessId: command.businessId,
      createdBy: command.createdBy,
      createdAt: now,
      updatedAt: now,
      updatedBy: command.createdBy,
      deletedAt: null,
      deletedBy: null,
      isDeleted: false,
    });

    const saved = await this.assignmentRepository.save(assignment);

    if (!saved.ok) return err(saved.error);

    return ok(assignment);
  }
}
