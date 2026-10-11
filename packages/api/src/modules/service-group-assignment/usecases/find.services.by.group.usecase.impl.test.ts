// find.services.by.group.usecase.impl.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import {
  err,
  IServiceGroupAssignmentRepository,
  InfrastructureError,
} from '@pikslots/domain';
import { FindServicesByGroupUseCaseImpl } from './find.services.by.group.usecase.impl';
import { ServiceGroupAssignmentRepositoryTestImpl } from '../repository/service.group.assignment.respository.fake.impl';
import { SERVICE_GROUP_ASSIGNMENT_TEST_DATA } from '../repository/service.group.assignment.fake.data';

describe('FindServicesByGroupUseCaseImpl', () => {
  let useCase: FindServicesByGroupUseCaseImpl;
  let repository: ServiceGroupAssignmentRepositoryTestImpl;
  let originalData: typeof SERVICE_GROUP_ASSIGNMENT_TEST_DATA;

  beforeEach(async () => {
    if (!originalData) originalData = [...SERVICE_GROUP_ASSIGNMENT_TEST_DATA];
    SERVICE_GROUP_ASSIGNMENT_TEST_DATA.length = 0;
    SERVICE_GROUP_ASSIGNMENT_TEST_DATA.push(...originalData);

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindServicesByGroupUseCaseImpl,
        {
          provide: IServiceGroupAssignmentRepository,
          useClass: ServiceGroupAssignmentRepositoryTestImpl,
        },
      ],
    }).compile();

    useCase = moduleRef.get(FindServicesByGroupUseCaseImpl);
    repository = moduleRef.get(IServiceGroupAssignmentRepository);
  });

  describe('successful lookup', () => {
    it('returns all active services assigned to the group', async () => {
      // group-styling-1 has haircut (sga-1, business-1), color (sga-2, business-1),
      // and manicure (sga-5, business-2) — all active. findServicesByGroup has no
      // businessId param, so it aggregates across businesses.
      const result = await useCase.execute('group-styling-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: 'service-haircut-1',
              title: 'Haircut',
            }),
            expect.objectContaining({
              id: 'service-color-1',
              title: 'Hair Coloring',
            }),
            expect.objectContaining({
              id: 'service-manicure-1',
              title: 'Manicure',
            }),
          ]),
        );
        expect(result.value).toHaveLength(3);
      }
    });

    it('excludes soft-deleted assignments', async () => {
      // service-massage-1 is only linked via sga-4 (group-grooming-1), soft-deleted.
      const result = await useCase.execute('group-grooming-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.some((s) => s.id === 'service-massage-1')).toBe(
          false,
        );
      }
    });

    it('returns an empty array for a group with no assignments', async () => {
      const result = await useCase.execute('group-nonexistent');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });

    it('does not return services belonging to a different group', async () => {
      // service-color-1 belongs only to group-styling-1
      const result = await useCase.execute('group-grooming-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.some((s) => s.id === 'service-color-1')).toBe(
          false,
        );
      }
    });
  });

  describe('repository interactions', () => {
    it('calls findServicesByGroup with the given serviceGroupId', async () => {
      const spy = jest.spyOn(repository, 'findServicesByGroup');

      await useCase.execute('group-styling-1');

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('group-styling-1');
    });
  });

  describe('repository failures', () => {
    it('propagates an InfrastructureError from findServicesByGroup', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to find services by group',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest
        .spyOn(repository, 'findServicesByGroup')
        .mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute('group-styling-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
    });
  });
});
