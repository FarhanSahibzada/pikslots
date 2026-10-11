import {
  InfrastructureError,
  ok,
  Result,
  ServiceSummary,
  ServiceUserAssignment,
  ServiceUserAssignmentRepository,
  UserSummary,
} from '@pikslots/domain';

import { SERVICE_USER_ASSIGNMENT_TEST_DATA } from './service.user.assignment.test.data';

export class ServiceUserAssignmentRepositoryTestImpl implements ServiceUserAssignmentRepository {
  constructor(
    private readonly data: ServiceUserAssignment[] = SERVICE_USER_ASSIGNMENT_TEST_DATA,
  ) {}

  async save(
    assignment: ServiceUserAssignment,
  ): Promise<Result<void, InfrastructureError>> {
    await Promise.resolve('');

    this.data.push(assignment);

    return ok(undefined);
  }

  async saveAll(
    assignments: ServiceUserAssignment[],
  ): Promise<Result<void, InfrastructureError>> {
    await Promise.resolve('');

    this.data.push(...assignments);

    return ok(undefined);
  }

  async findById(
    id: string,
  ): Promise<Result<ServiceUserAssignment | null, InfrastructureError>> {
    await Promise.resolve('');

    const found = this.data.find((a) => a.id === id);

    return ok(found ?? null);
  }

  async findAllByService(
    serviceId: string,
  ): Promise<Result<ServiceUserAssignment[], InfrastructureError>> {
    await Promise.resolve('');

    return ok(this.data.filter((a) => a.serviceId === serviceId));
  }

  async findAllByUser(
    userId: string,
  ): Promise<Result<ServiceUserAssignment[], InfrastructureError>> {
    await Promise.resolve('');

    return ok(this.data.filter((a) => a.userId === userId));
  }

  async findAllByBusiness(
    businessId: string,
  ): Promise<Result<ServiceUserAssignment[], InfrastructureError>> {
    await Promise.resolve('');

    return ok(this.data.filter((a) => a.businessId === businessId));
  }

  async findByServiceAndUser(
    serviceId: string,
    userId: string,
  ): Promise<Result<ServiceUserAssignment | null, InfrastructureError>> {
    await Promise.resolve('');

    const found = this.data.find(
      (a) => a.serviceId === serviceId && a.userId === userId && !a.isDeleted,
    );

    return ok(found ?? null);
  }

  async existsByServiceAndUser(
    serviceId: string,
    userId: string,
  ): Promise<Result<boolean, InfrastructureError>> {
    await Promise.resolve('');

    return ok(
      this.data.some(
        (a) => a.serviceId === serviceId && a.userId === userId && !a.isDeleted,
      ),
    );
  }

  async findUsersByService(
    serviceId: string,
  ): Promise<Result<UserSummary[], InfrastructureError>> {
    await Promise.resolve('');

    return ok(
      this.data
        .filter((a) => a.serviceId === serviceId && !a.isDeleted)
        .map((a) => ({
          id: a.userId,
          firstName: `First-${a.userId}`,
          lastName: `Last-${a.userId}`,
        })),
    );
  }

  async findServicesByUser(
    userId: string,
  ): Promise<Result<ServiceSummary[], InfrastructureError>> {
    await Promise.resolve('');

    return ok(
      this.data
        .filter((a) => a.userId === userId && !a.isDeleted)
        .map((a) => ({
          id: a.serviceId,
          title: `Service ${a.serviceId}`,
          durationInMins: 30,
          bufferTimeInMins: 10,
          cost: 2500,
          colorCode: '#F54927',
        })),
    );
  }

  async update(
    assignment: ServiceUserAssignment,
  ): Promise<Result<void, InfrastructureError>> {
    await Promise.resolve('');

    const index = this.data.findIndex((a) => a.id === assignment.id);

    if (index !== -1) {
      this.data[index] = assignment;
    }

    return ok(undefined);
  }

  async deleteById(id: string): Promise<Result<void, InfrastructureError>> {
    await Promise.resolve('');

    const index = this.data.findIndex((a) => a.id === id);

    if (index !== -1) {
      this.data.splice(index, 1);
    }

    return ok(undefined);
  }
}
