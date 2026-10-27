import {
  err,
  InfrastructureError,
  RemoveUserFromServiceCommand,
} from '@pikslots/domain';
import { RemoveUserFromServiceUseCaseImpl } from './remove.user.from.service.usecase.impl';
import { ServiceUserAssignmentRepositoryTestImpl } from '../repository/service.user.assignment.repository.fake.impl';
import { SERVICE_USER_ASSIGNMENT_TEST_DATA } from '../repository/service.user.assignment.test.data';

describe('RemoveUserFromServiceUseCaseImpl', () => {
  let repository: ServiceUserAssignmentRepositoryTestImpl;
  let useCase: RemoveUserFromServiceUseCaseImpl;

  beforeEach(() => {
    repository = new ServiceUserAssignmentRepositoryTestImpl([
      ...SERVICE_USER_ASSIGNMENT_TEST_DATA,
    ]);

    useCase = new RemoveUserFromServiceUseCaseImpl(repository, {
      add: jest.fn().mockResolvedValue(undefined),
    } as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function buildCommand(
    overrides: Partial<RemoveUserFromServiceCommand> = {},
  ): RemoveUserFromServiceCommand {
    return {
      serviceId: 'service-1',
      userId: 'user-1',
      deletedBy: 'owner-1',
      ...overrides,
    };
  }

  describe('execute', () => {
    it('should remove a user from a service', async () => {
      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(true);

      const assignment = await repository.findByServiceAndUser(
        'service-1',
        'user-1',
      );

      expect(assignment.ok).toBe(true);

      if (assignment.ok) {
        expect(assignment.value).toBeNull();
      }
    });

    it('should soft delete the assignment', async () => {
      const updateSpy = jest.spyOn(repository, 'update');

      await useCase.execute(buildCommand());

      expect(updateSpy).toHaveBeenCalledTimes(1);

      const updatedAssignment = updateSpy.mock.calls[0][0];

      expect(updatedAssignment.isDeleted).toBe(true);
      expect(updatedAssignment.deletedBy).toBe('owner-1');
      expect(updatedAssignment.deletedAt).not.toBeNull();
      expect(updatedAssignment.updatedBy).toBe('owner-1');
    });

    it('should return ServiceUserAssignmentNotFoundError when assignment does not exist', async () => {
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({
          serviceId: 'unknown-service',
          userId: 'unknown-user',
        }),
      );

      expect(result.ok).toBe(false);

      if (!result.ok) {
        expect(result.error.kind).toBe('service_user_assignment_not_found');
      }

      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('should call findByServiceAndUser with correct arguments', async () => {
      const spy = jest.spyOn(repository, 'findByServiceAndUser');

      await useCase.execute(buildCommand());

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('service-1', 'user-1');
    });

    it('should call update once', async () => {
      const spy = jest.spyOn(repository, 'update');

      await useCase.execute(buildCommand());

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should check assignment before updating', async () => {
      const findSpy = jest.spyOn(repository, 'findByServiceAndUser');

      const updateSpy = jest.spyOn(repository, 'update');

      await useCase.execute(buildCommand());

      expect(findSpy.mock.invocationCallOrder[0]).toBeLessThan(
        updateSpy.mock.invocationCallOrder[0],
      );
    });

    it('should propagate InfrastructureError from findByServiceAndUser', async () => {
      const infrastructureError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Database failure',
        timestamp: new Date(),
        cause: new Error(),
      };

      jest
        .spyOn(repository, 'findByServiceAndUser')
        .mockResolvedValueOnce(err(infrastructureError));

      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);

      if (!result.ok) {
        expect(result.error).toBe(infrastructureError);
      }

      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('should propagate InfrastructureError from update', async () => {
      const infrastructureError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Database failure',
        timestamp: new Date(),
        cause: new Error(),
      };

      jest
        .spyOn(repository, 'update')
        .mockResolvedValueOnce(err(infrastructureError));

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);

      if (!result.ok) {
        expect(result.error).toBe(infrastructureError);
      }
    });

    it('should treat soft deleted assignments as not found', async () => {
      const result = await useCase.execute(
        buildCommand({
          serviceId: 'service-4',
          userId: 'user-4',
        }),
      );

      expect(result.ok).toBe(false);

      if (!result.ok) {
        expect(result.error.kind).toBe('service_user_assignment_not_found');
      }
    });
  });
});
