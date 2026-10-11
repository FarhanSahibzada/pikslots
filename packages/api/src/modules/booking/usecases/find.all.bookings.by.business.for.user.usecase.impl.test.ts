import { Test, TestingModule } from '@nestjs/testing';
import {
  err,
  IBookingRepository,
  InfrastructureError,
  UnauthorizedError,
} from '@pikslots/domain';
import { BOOKING_TEST_DATA } from '../repository/booking.test.data';
import { BookingRepositoryTestImpl } from '../repository/booking.repository.fake.impl';
import { FindAllBookingsByBusinessForUserUseCaseImpl } from './find.all.bookings.by.business.for.user.usecase.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';

describe('FindAllBookingsByBusinessForUserUseCaseImpl', () => {
  let useCase: FindAllBookingsByBusinessForUserUseCaseImpl;
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
        FindAllBookingsByBusinessForUserUseCaseImpl,
        { provide: IBookingRepository, useClass: BookingRepositoryTestImpl },
        { provide: SecurityContext, useValue: securityContext },
      ],
    }).compile();

    useCase = moduleRef.get(FindAllBookingsByBusinessForUserUseCaseImpl);
    repository = moduleRef.get(IBookingRepository);
  });

  describe('authorization', () => {
    it('allows a Platform Owner to view bookings for any business/user combo', async () => {
      Object.assign(securityContext, {
        userId: 'user-platform-owner-1',
        role: 'Platform Owner',
        businessId: 'business-999',
      });

      const result = await useCase.execute(
        'business-1',
        'user-standard-1',
        '2024-01-01',
        '2024-12-31',
        'UTC',
      );

      expect(result.ok).toBe(true);
    });

    it('allows a Business Owner to view bookings within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        'business-1',
        'user-standard-1',
        '2024-01-01',
        '2024-12-31',
        'UTC',
      );

      expect(result.ok).toBe(true);
    });

    it('denies a Business Owner acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-2',
      });

      const result = await useCase.execute(
        'business-1',
        'user-standard-1',
        '2024-01-01',
        '2024-12-31',
        'UTC',
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
    });

    it('allows an Admin to view bookings within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        'business-1',
        'user-enhanced-1',
        '2024-01-01',
        '2024-12-31',
        'UTC',
      );

      expect(result.ok).toBe(true);
    });

    it('denies an Admin acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-2',
      });

      const result = await useCase.execute(
        'business-1',
        'user-enhanced-1',
        '2024-01-01',
        '2024-12-31',
        'UTC',
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
    });

    it('allows an Enhanced user to view bookings within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        'business-1',
        'user-standard-1',
        '2024-01-01',
        '2024-12-31',
        'UTC',
      ); // not self, but Enhanced doesn't need isSelf

      expect(result.ok).toBe(true);
    });

    it('denies an Enhanced user acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-2',
      });

      const result = await useCase.execute(
        'business-1',
        'user-standard-1',
        '2024-01-01',
        '2024-12-31',
        'UTC',
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
    });

    it('allows a Standard user to view their own bookings', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        'business-1',
        'user-standard-1',
        '2024-01-01',
        '2024-12-31',
        'UTC',
      );

      expect(result.ok).toBe(true);
    });

    it("denies a Standard user viewing someone else's bookings, even in the same business", async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        'business-1',
        'user-enhanced-1',
        '2024-01-01',
        '2024-12-31',
        'UTC',
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
    });

    it('denies a Standard user viewing their own bookings under a mismatched business', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-2',
      });

      const result = await useCase.execute(
        'business-1',
        'user-standard-1',
        '2024-01-01',
        '2024-12-31',
        'UTC',
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
    });
  });

  describe('self-scoping behavior (canViewSelfBookings branch)', () => {
    it('calls findAllByBusinessForUser (not findAllByBusiness) for a Standard user viewing themselves', async () => {
      const forUserSpy = jest.spyOn(repository, 'findAllByBusinessForUser');
      const allSpy = jest.spyOn(repository, 'findAllByBusiness');

      await useCase.execute(
        'business-1',
        'user-standard-1',
        '2024-01-01',
        '2024-12-31',
        'UTC',
      );

      expect(forUserSpy).toHaveBeenCalledTimes(1);
      expect(forUserSpy).toHaveBeenCalledWith('business-1', 'user-standard-1');
      expect(allSpy).not.toHaveBeenCalled();
    });

    it("returns only the Standard user's own bookings, excluding other users' bookings in the same business", async () => {
      const result = await useCase.execute(
        'business-1',
        'user-standard-1',
        '2024-01-01',
        '2024-12-31',
        'UTC',
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        const ids = result.value.map((b) => b.id);
        expect(ids).toEqual(expect.arrayContaining(['booking-1', 'booking-2']));
        expect(ids).not.toContain('booking-3'); // user-enhanced-1's booking
        expect(ids).not.toContain('booking-6'); // user-enhanced-1's booking
      }
    });
  });

  describe('always uses findAllByBusinessForUser', () => {
    it('calls findAllByBusinessForUser for a Business Owner', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });
      const forUserSpy = jest.spyOn(repository, 'findAllByBusinessForUser');

      await useCase.execute(
        'business-1',
        'user-standard-1',
        '2024-01-01',
        '2024-12-31',
        'UTC',
      );

      expect(forUserSpy).toHaveBeenCalledTimes(1);
      expect(forUserSpy).toHaveBeenCalledWith('business-1', 'user-standard-1');
    });

    it('returns only the specified user bookings when called by a Business Owner', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        'business-1',
        'user-standard-1',
        '2024-01-01',
        '2024-12-31',
        'UTC',
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        const ids = result.value.map((b) => b.id);
        expect(ids).toEqual(expect.arrayContaining(['booking-1', 'booking-2']));
        expect(ids).not.toContain('booking-3');
        expect(ids).not.toContain('booking-6');
      }
    });

    it('calls findAllByBusinessForUser for an Enhanced user', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });
      const forUserSpy = jest.spyOn(repository, 'findAllByBusinessForUser');

      const result = await useCase.execute(
        'business-1',
        'user-enhanced-1',
        '2024-01-01',
        '2024-12-31',
        'UTC',
      );

      expect(forUserSpy).toHaveBeenCalledTimes(1);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const ids = result.value.map((b) => b.id);
        expect(ids).toEqual(expect.arrayContaining(['booking-3', 'booking-6']));
        expect(ids).not.toContain('booking-1');
      }
    });
  });

  describe('excludes soft-deleted bookings', () => {
    it('does not return a soft-deleted booking via the self-scoped path', async () => {
      const result = await useCase.execute(
        'business-1',
        'user-standard-1',
        '2024-01-01',
        '2024-12-31',
        'UTC',
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.some((b) => b.id === 'booking-4')).toBe(false); // soft-deleted
      }
    });

    it('does not return a soft-deleted booking for an elevated role', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        'business-1',
        'user-standard-1',
        '2024-01-01',
        '2024-12-31',
        'UTC',
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.some((b) => b.id === 'booking-4')).toBe(false);
      }
    });
  });

  describe('repository failures', () => {
    it('propagates an InfrastructureError from findAllByBusinessForUser (self-scoped path)', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to find bookings by business',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest
        .spyOn(repository, 'findAllByBusinessForUser')
        .mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute(
        'business-1',
        'user-standard-1',
        '2024-01-01',
        '2024-12-31',
        'UTC',
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
    });

    it('propagates an InfrastructureError from findAllByBusinessForUser (elevated-role path)', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to find bookings by business',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest
        .spyOn(repository, 'findAllByBusinessForUser')
        .mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute(
        'business-1',
        'user-standard-1',
        '2024-01-01',
        '2024-12-31',
        'UTC',
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
    });
  });

  describe('successful lookup', () => {
    it('returns an empty array when the user has no bookings in that business', async () => {
      Object.assign(securityContext, {
        userId: 'user-with-none',
        role: 'Standard',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        'business-1',
        'user-with-none',
        '2024-01-01',
        '2024-12-31',
        'UTC',
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });

    it('does not leak bookings from a different business', async () => {
      const result = await useCase.execute(
        'business-1',
        'user-standard-1',
        '2024-01-01',
        '2024-12-31',
        'UTC',
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.some((b) => b.id === 'booking-5')).toBe(false); // business-2
      }
    });
  });
});
