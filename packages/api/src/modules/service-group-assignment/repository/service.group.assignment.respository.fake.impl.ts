import {
  err,
  InfrastructureError,
  ok,
  Result,
  ServiceGroupAssignment,
  ServiceGroupSummary,
  ServiceSummary,
} from '@pikslots/domain';
import type { ServiceGroupAssignmentRepository } from '@pikslots/domain';
import {
  SERVICE_GROUP_ASSIGNMENT_TEST_DATA,
  SERVICE_GROUP_NAME_LOOKUP,
  SERVICE_TITLE_LOOKUP,
} from './service.group.assignment.fake.data';

export class ServiceGroupAssignmentRepositoryTestImpl implements ServiceGroupAssignmentRepository {
  async save(
    membership: ServiceGroupAssignment,
  ): Promise<Result<void, InfrastructureError>> {
    await Promise.resolve('');
    SERVICE_GROUP_ASSIGNMENT_TEST_DATA.push(membership);
    return ok(undefined);
  }

  async saveAll(
    membership: ServiceGroupAssignment[],
  ): Promise<Result<void, InfrastructureError>> {
    await Promise.resolve('');
    SERVICE_GROUP_ASSIGNMENT_TEST_DATA.push(...membership);
    return ok(undefined);
  }

  async findById(
    id: string,
  ): Promise<Result<ServiceGroupAssignment | null, InfrastructureError>> {
    await Promise.resolve('');
    return ok(
      SERVICE_GROUP_ASSIGNMENT_TEST_DATA.find((a) => a.id === id) ?? null,
    );
  }

  async findAllByServiceGroup(
    serviceGroupId: string,
  ): Promise<Result<ServiceGroupAssignment[], InfrastructureError>> {
    await Promise.resolve('');
    return ok(
      SERVICE_GROUP_ASSIGNMENT_TEST_DATA.filter(
        (a) => a.serviceGroupId === serviceGroupId,
      ),
    );
  }

  async findAllByService(
    serviceId: string,
  ): Promise<Result<ServiceGroupAssignment[], InfrastructureError>> {
    await Promise.resolve('');
    return ok(
      SERVICE_GROUP_ASSIGNMENT_TEST_DATA.filter(
        (a) => a.serviceId === serviceId,
      ),
    );
  }

  async findAllByBusiness(
    businessId: string,
  ): Promise<Result<ServiceGroupAssignment[], InfrastructureError>> {
    await Promise.resolve('');
    return ok(
      SERVICE_GROUP_ASSIGNMENT_TEST_DATA.filter(
        (a) => a.businessId === businessId,
      ),
    );
  }

  async findByServiceAndGroup(
    serviceId: string,
    serviceGroupId: string,
  ): Promise<Result<ServiceGroupAssignment | null, InfrastructureError>> {
    await Promise.resolve('');
    return ok(
      SERVICE_GROUP_ASSIGNMENT_TEST_DATA.find(
        (a) =>
          a.serviceId === serviceId &&
          a.serviceGroupId === serviceGroupId &&
          !a.isDeleted,
      ) ?? null,
    );
  }

  async existsByServiceAndGroup(
    serviceId: string,
    serviceGroupId: string,
  ): Promise<Result<boolean, InfrastructureError>> {
    await Promise.resolve('');
    return ok(
      SERVICE_GROUP_ASSIGNMENT_TEST_DATA.some(
        (a) =>
          a.serviceId === serviceId &&
          a.serviceGroupId === serviceGroupId &&
          !a.isDeleted,
      ),
    );
  }

  async findGroupsByService(
    serviceId: string,
  ): Promise<Result<ServiceGroupSummary[], InfrastructureError>> {
    await Promise.resolve('');
    const groups = SERVICE_GROUP_ASSIGNMENT_TEST_DATA.filter(
      (a) => a.serviceId === serviceId && !a.isDeleted,
    ).map((a) => ({
      id: a.serviceGroupId,
      name: SERVICE_GROUP_NAME_LOOKUP[a.serviceGroupId] ?? '',
    }));
    return ok(groups);
  }

  async findServicesByGroup(
    serviceGroupId: string,
  ): Promise<Result<ServiceSummary[], InfrastructureError>> {
    await Promise.resolve('');
    const services = SERVICE_GROUP_ASSIGNMENT_TEST_DATA.filter(
      (a) => a.serviceGroupId === serviceGroupId && !a.isDeleted,
    ).map((a) => ({
      id: a.serviceId,
      title: SERVICE_TITLE_LOOKUP[a.serviceId] ?? '',
      durationInMins: 30,
      bufferTimeInMins: 10,
      cost: 2500,
      colorCode: '#F54927',
    }));
    return ok(services);
  }

  async update(
    membership: ServiceGroupAssignment,
  ): Promise<Result<void, InfrastructureError>> {
    await Promise.resolve('');
    const index = SERVICE_GROUP_ASSIGNMENT_TEST_DATA.findIndex(
      (a) => a.id === membership.id,
    );
    if (index === -1) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Service group assignment not found for update',
        timestamp: new Date(),
        cause: undefined,
      });
    }
    SERVICE_GROUP_ASSIGNMENT_TEST_DATA[index] = membership;
    return ok(undefined);
  }

  async deleteById(id: string): Promise<Result<void, InfrastructureError>> {
    await Promise.resolve('');
    const index = SERVICE_GROUP_ASSIGNMENT_TEST_DATA.findIndex(
      (a) => a.id === id,
    );
    if (index !== -1) SERVICE_GROUP_ASSIGNMENT_TEST_DATA.splice(index, 1);
    return ok(undefined);
  }
}
