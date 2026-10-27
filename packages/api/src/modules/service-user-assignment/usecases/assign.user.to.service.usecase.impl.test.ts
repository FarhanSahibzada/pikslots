jest.mock('uuid', () => ({
  v7: () => 'generated-uuid',
}));
import {
  AssignUserToServiceCommand,
  err,
  InfrastructureError,
} from '@pikslots/domain';
import { AssignUserToServiceUseCaseImpl } from './assign.user.to.service.usecase.impl';
import { ServiceUserAssignmentRepositoryTestImpl } from '../repository/service.user.assignment.repository.fake.impl';
import { SERVICE_USER_ASSIGNMENT_TEST_DATA } from '../repository/service.user.assignment.test.data';

describe('AssignUserToServiceUseCaseImpl', () => {
  let repository: ServiceUserAssignmentRepositoryTestImpl;
  let useCase: AssignUserToServiceUseCaseImpl;

  beforeEach(() => {
    repository = new ServiceUserAssignmentRepositoryTestImpl([
      ...SERVICE_USER_ASSIGNMENT_TEST_DATA,
    ]);

    useCase = new AssignUserToServiceUseCaseImpl(repository, {
      add: jest.fn().mockResolvedValue(undefined),
    } as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function buildCommand(
    overrides: Partial<AssignUserToServiceCommand> = {},
  ): AssignUserToServiceCommand {
    return {
      serviceId: 'service-new',
      userId: 'user-new',
      businessId: 'business-1',
      createdBy: 'owner-1',
      ...overrides,
    };
  }

  describe('execute', () => {
    it('should assign a user to a service', async () => {
      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(true);

      if (!result.ok) return;

      expect(result.value.serviceId).toBe('service-new');
      expect(result.value.userId).toBe('user-new');
      expect(result.value.businessId).toBe('business-1');
      expect(result.value.createdBy).toBe('owner-1');

      const saved = await repository.findByServiceAndUser(
        'service-new',
        'user-new',
      );

      expect(saved.ok).toBe(true);

      if (saved.ok) {
        expect(saved.value).not.toBeNull();
      }
    });

    it('should generate an id', async () => {
      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(true);

      if (!result.ok) return;

      expect(result.value.id).toBeDefined();
      expect(result.value.id.length).toBeGreaterThan(0);
    });

    it('should save the assignment once', async () => {
      const spy = jest.spyOn(repository, 'save');

      await useCase.execute(buildCommand());

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should call existsByServiceAndUser with correct arguments', async () => {
      const spy = jest.spyOn(repository, 'existsByServiceAndUser');

      await useCase.execute(buildCommand());

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('service-new', 'user-new');
    });

    it('should check existence before saving', async () => {
      const existsSpy = jest.spyOn(repository, 'existsByServiceAndUser');

      const saveSpy = jest.spyOn(repository, 'save');

      await useCase.execute(buildCommand());

      expect(existsSpy.mock.invocationCallOrder[0]).toBeLessThan(
        saveSpy.mock.invocationCallOrder[0],
      );
    });

    it('should return ServiceUserAssignmentAlreadyExistsError when assignment already exists', async () => {
      const saveSpy = jest.spyOn(repository, 'save');

      const result = await useCase.execute(
        buildCommand({
          serviceId: 'service-1',
          userId: 'user-1',
        }),
      );

      expect(result.ok).toBe(false);

      if (!result.ok) {
        expect(result.error.kind).toBe(
          'service_user_assignment_already_exists',
        );
      }

      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('should propagate InfrastructureError from existsByServiceAndUser', async () => {
      const infrastructureError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Database failure',
        timestamp: new Date(),
        cause: new Error(),
      };

      jest
        .spyOn(repository, 'existsByServiceAndUser')
        .mockResolvedValueOnce(err(infrastructureError));

      const saveSpy = jest.spyOn(repository, 'save');

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);

      if (!result.ok) {
        expect(result.error).toBe(infrastructureError);
      }

      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('should propagate InfrastructureError from save', async () => {
      const infrastructureError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Database failure',
        timestamp: new Date(),
        cause: new Error(),
      };

      jest
        .spyOn(repository, 'save')
        .mockResolvedValueOnce(err(infrastructureError));

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);

      if (!result.ok) {
        expect(result.error).toBe(infrastructureError);
      }
    });

    it('should allow assigning the same user to different services', async () => {
      const result = await useCase.execute(
        buildCommand({
          serviceId: 'service-new',
          userId: 'user-1',
        }),
      );

      expect(result.ok).toBe(true);
    });

    it('should allow assigning different users to the same service', async () => {
      const result = await useCase.execute(
        buildCommand({
          serviceId: 'service-1',
          userId: 'user-new',
        }),
      );

      expect(result.ok).toBe(true);
    });
  });
});
