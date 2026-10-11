import { Test, TestingModule } from '@nestjs/testing';
import {
  err,
  FindBookingByIdCommand,
  IBookingRepository,
  InfrastructureError,
  BookingNotFoundError,
  UnauthorizedError,
} from '@pikslots/domain';
import { BOOKING_TEST_DATA } from '../repository/booking.test.data';
import { BookingRepositoryTestImpl } from '../repository/booking.repository.fake.impl';
import { FindBookingByIdUseCaseImpl } from './find.booking.by.id.usecase.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';

function buildCommand(
  overrides: Partial<FindBookingByIdCommand> = {},
): FindBookingByIdCommand {
  return {
    bookingId: 'booking-1',
    ...overrides,
  };
}

describe('FindBookingByIdUseCaseImpl', () => {
  let useCase: FindBookingByIdUseCaseImpl;
  let repository: BookingRepositoryTestImpl;
  let securityContext: SecurityContext;
  let originalData: typeof BOOKING_TEST_DATA;

  beforeEach(async () => {
    if (!originalData) originalData = [...BOOKING_TEST_DATA];
    BOOKING_TEST_DATA.length = 0;
    BOOKING_TEST_DATA.push(...originalData);

    securityContext = {
      userId: 'user-standard-1',
      role: 'Standard',
      businessId: 'business-1',
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindBookingByIdUseCaseImpl,
        { provide: IBookingRepository, useClass: BookingRepositoryTestImpl },
        { provide: SecurityContext, useValue: securityContext },
      ],
    }).compile();

    useCase = moduleRef.get(FindBookingByIdUseCaseImpl);
    repository = moduleRef.get(IBookingRepository);
  });

  describe('authorization', () => {
    it('allows a Platform Owner to view any booking regardless of business', async () => {
      Object.assign(securityContext, {
        userId: 'user-platform-owner-1',
        role: 'Platform Owner',
        businessId: 'business-999',
      });

      const result = await useCase.execute(
        buildCommand({ bookingId: 'booking-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows a Business Owner to view a booking within their own business, even if not the booked user', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ bookingId: 'booking-1' }),
      ); // owned by user-standard-1

      expect(result.ok).toBe(true);
    });

    it('denies a Business Owner acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-2',
      });

      const result = await useCase.execute(
        buildCommand({ bookingId: 'booking-1' }),
      ); // business-1

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
    });

    it('allows an Admin to view a booking within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ bookingId: 'booking-3' }),
      ); // user-enhanced-1, business-1

      expect(result.ok).toBe(true);
    });

    it('denies an Admin acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-2',
      });

      const result = await useCase.execute(
        buildCommand({ bookingId: 'booking-3' }),
      ); // business-1

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
    });

    it('allows an Enhanced user to view a booking within their own business, even if not the booked user', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ bookingId: 'booking-1' }),
      ); // owned by user-standard-1

      expect(result.ok).toBe(true);
    });

    it('denies an Enhanced user acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-2',
      });

      const result = await useCase.execute(
        buildCommand({ bookingId: 'booking-1' }),
      ); // business-1

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
    });

    it('allows a Standard user to view their own booking', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ bookingId: 'booking-1' }),
      ); // owned by user-standard-1

      expect(result.ok).toBe(true);
    });

    it("denies a Standard user viewing someone else's booking, even in the same business", async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ bookingId: 'booking-3' }),
      ); // owned by user-enhanced-1

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
    });

    it('denies a Standard user viewing their own booking under a mismatched business context', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-2',
      });

      const result = await useCase.execute(
        buildCommand({ bookingId: 'booking-1' }),
      ); // record's businessId is business-1

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
    });
  });

  describe('not found', () => {
    it('returns BookingNotFoundError when the booking does not exist', async () => {
      const result = await useCase.execute(
        buildCommand({ bookingId: 'booking-nonexistent' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as BookingNotFoundError).kind).toBe(
          'booking_not_found',
        );
      }
    });

    it('returns BookingNotFoundError for a soft-deleted booking (findById excludes deleted rows)', async () => {
      const result = await useCase.execute(
        buildCommand({ bookingId: 'booking-4' }),
      ); // soft-deleted in fixture

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as BookingNotFoundError).kind).toBe(
          'booking_not_found',
        );
      }
    });
  });

  describe('repository failures', () => {
    it('propagates an InfrastructureError from findById', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'DB unreachable',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest.spyOn(repository, 'findById').mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
    });
  });

  describe('repository interactions', () => {
    it('calls findById with the command bookingId', async () => {
      const findByIdSpy = jest.spyOn(repository, 'findById');

      await useCase.execute(buildCommand({ bookingId: 'booking-1' }));

      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(findByIdSpy).toHaveBeenCalledWith('booking-1');
    });
  });

  describe('successful lookup', () => {
    it('returns the booking as a plain props object (via toProps())', async () => {
      const result = await useCase.execute(
        buildCommand({ bookingId: 'booking-1' }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe('booking-1');
        expect(result.value.bookingId).toBe('BK0000001');
        expect(result.value.userId).toBe('user-standard-1');
        expect(result.value.businessId).toBe('business-1');
        expect(result.value.serviceSnapshot).toEqual({
          title: 'Haircut',
          durationInMins: 30,
          cost: 25,
          colorCode: '#F54927',
        });
      }
    });

    it('returns the full BookingProps shape, including audit fields (unlike the narrowed Pick used elsewhere)', async () => {
      const result = await useCase.execute(
        buildCommand({ bookingId: 'booking-1' }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveProperty('createdAt');
        expect(result.value).toHaveProperty('createdBy');
        expect(result.value).toHaveProperty('updatedAt');
        expect(result.value).toHaveProperty('updatedBy');
        expect(result.value).toHaveProperty('isDeleted');
        expect(result.value).toHaveProperty('deletedAt');
        expect(result.value).toHaveProperty('deletedBy');
      }
    });
  });
});
