import { err, InfrastructureError } from '@pikslots/domain';
import { FindServicesByUserUseCaseImpl } from './find.services.by.user.usecase.impl';
import { ServiceUserAssignmentRepositoryTestImpl } from '../repository/service.user.assignment.repository.fake.impl';
import { SERVICE_USER_ASSIGNMENT_TEST_DATA } from '../repository/service.user.assignment.test.data';

describe('FindServicesByUserUseCaseImpl', () => {
  let repository: ServiceUserAssignmentRepositoryTestImpl;
  let useCase: FindServicesByUserUseCaseImpl;

  beforeEach(() => {
    repository = new ServiceUserAssignmentRepositoryTestImpl(
      SERVICE_USER_ASSIGNMENT_TEST_DATA,
    );

    useCase = new FindServicesByUserUseCaseImpl(repository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('should return all services assigned to a user', async () => {
      const result = await useCase.execute('user-1');

      expect(result.ok).toBe(true);

      if (result.ok) {
        expect(result.value).toHaveLength(2);

        expect(result.value).toEqual([
          {
            id: 'service-1',
            title: 'Service service-1',
            durationInMins: 30,
            bufferTimeInMins: 10,
            cost: 2500,
            colorCode: '#F54927',
          },
          {
            id: 'service-2',
            title: 'Service service-2',
            durationInMins: 30,
            bufferTimeInMins: 10,
            cost: 2500,
            colorCode: '#F54927',
          },
        ]);
      }
    });

    it('should return an empty array when the user has no assigned services', async () => {
      const result = await useCase.execute('unknown-user');

      expect(result.ok).toBe(true);

      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });

    it('should not return soft deleted assignments', async () => {
      const result = await useCase.execute('user-4');

      expect(result.ok).toBe(true);

      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });

    it('should call repository with the correct user id', async () => {
      const spy = jest.spyOn(repository, 'findServicesByUser');

      await useCase.execute('user-1');

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('user-1');
    });

    it('should propagate InfrastructureError returned by repository', async () => {
      const infrastructureError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Database connection failed',
        timestamp: new Date(),
        cause: new Error('DB Error'),
      };

      jest
        .spyOn(repository, 'findServicesByUser')
        .mockResolvedValueOnce(err(infrastructureError));

      const result = await useCase.execute('user-1');

      expect(result.ok).toBe(false);

      if (!result.ok) {
        expect(result.error).toBe(infrastructureError);
      }
    });
  });
});
