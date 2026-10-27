import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import {
  Customer,
  CustomerLinks,
  CustomerNotFoundError,
  EditCustomerCommand,
  err,
  ICustomerRepository,
  InfrastructureError,
  UnauthorizedError,
} from '@pikslots/domain';
import { CUSTOMER_TEST_DATA } from '../repository/customer.test.data';
import { EditCustomerUseCaseImpl } from './edit.customer.usecase.impl';
import { CustomerRepositoryTestImpl } from '../repository/customer.repository.fake.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { AUDIT_LOG_QUEUE } from 'src/shared/queue/jobs/pikslot.events';

const SOCIAL_LINKS: CustomerLinks = {
  Website: 'https://updated-example.com',
  Instagram: '',
  Facebook: '',
  Tiktok: '',
  X: '',
  Youtube: '',
  LinkedIn: '',
};

function buildCommand(
  overrides: Partial<EditCustomerCommand> = {},
): EditCustomerCommand {
  return {
    id: 'customer-1',
    name: { firstName: 'Alice', lastName: 'Walker-Updated' },
    profileImageUrl: 'https://cdn.example.com/avatars/customer-1-new.jpg',
    email: 'alice.updated@example.com',
    additionalEmail: null,
    primaryPhone: '+1-555-9999',
    additionalPhone: null,
    company: 'Walker Design Co.',
    country: 'USA',
    address: '99 Updated Ave',
    city: 'Austin',
    state: 'TX',
    zipCode: '73301',
    notes: 'Updated notes.',
    customerSocialLinks: SOCIAL_LINKS,
    updatedBy: 'user-business-owner-1',
    ...overrides,
  } as EditCustomerCommand;
}

describe('EditCustomerUseCaseImpl', () => {
  let useCase: EditCustomerUseCaseImpl;
  let repository: CustomerRepositoryTestImpl;
  let securityContext: SecurityContext;
  let originalData: Customer[];

  beforeEach(async () => {
    // Snapshot once, restore before every test so update() in one test
    // can't leave fixtures mutated for a later test.
    if (!originalData) originalData = [...CUSTOMER_TEST_DATA];
    CUSTOMER_TEST_DATA.length = 0;
    CUSTOMER_TEST_DATA.push(...originalData);

    securityContext = {
      userId: 'user-business-owner-1',
      role: 'Business Owner',
      businessId: 'business-1',
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        EditCustomerUseCaseImpl,
        {
          provide: ICustomerRepository,
          useClass: CustomerRepositoryTestImpl,
        },
        { provide: SecurityContext, useValue: securityContext },
        {
          provide: getQueueToken(AUDIT_LOG_QUEUE),
          useValue: { add: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    useCase = moduleRef.get(EditCustomerUseCaseImpl);
    repository = moduleRef.get(ICustomerRepository);
  });

  describe('not found', () => {
    it('returns customer_not_found when the customer does not exist', async () => {
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({ id: 'non-existent-customer' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as CustomerNotFoundError).kind).toBe(
          'customer_not_found',
        );
      }
      expect(updateSpy).not.toHaveBeenCalled();
    });
  });

  describe('authorization', () => {
    it('allows a Platform Owner to edit any customer', async () => {
      Object.assign(securityContext, {
        userId: 'user-platform-owner-1',
        role: 'Platform Owner',
        businessId: 'business-999', // different business, shouldn't matter
      });

      const result = await useCase.execute(
        buildCommand({ id: 'customer-business-2-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows a Business Owner to edit a customer within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });

      const result = await useCase.execute(buildCommand({ id: 'customer-1' }));

      expect(result.ok).toBe(true);
    });

    it('allows an Admin to edit a customer within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-1',
      });

      const result = await useCase.execute(buildCommand({ id: 'customer-2' }));

      expect(result.ok).toBe(true);
    });

    it('allows an Enhanced user to edit a customer within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });

      const result = await useCase.execute(buildCommand({ id: 'customer-3' }));

      expect(result.ok).toBe(true);
    });

    it('allows a Standard user to edit a customer within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });

      const result = await useCase.execute(buildCommand({ id: 'customer-1' }));

      expect(result.ok).toBe(true);
    });

    it('denies a Business Owner acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({ id: 'customer-business-2-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('denies an Admin acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-1',
      });
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({ id: 'customer-business-2-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('denies an Enhanced user acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({ id: 'customer-business-2-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('denies a Standard user acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({ id: 'customer-business-2-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(updateSpy).not.toHaveBeenCalled();
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
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('propagates an InfrastructureError from update', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to update customer',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest.spyOn(repository, 'update').mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute(buildCommand({ id: 'customer-1' }));

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
    });

    it('propagates a CustomerNotFoundError raised by update itself', async () => {
      const notFoundError: CustomerNotFoundError = {
        kind: 'customer_not_found',
        by: 'id',
        value: 'customer-1',
        message: 'Customer not found',
        timestamp: new Date(),
      };
      jest
        .spyOn(repository, 'update')
        .mockResolvedValueOnce(err(notFoundError));

      const result = await useCase.execute(buildCommand({ id: 'customer-1' }));

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as CustomerNotFoundError).kind).toBe(
          'customer_not_found',
        );
      }
    });
  });

  describe('successful edit', () => {
    it('updates the customer and returns ok(undefined)', async () => {
      const updateSpy = jest.spyOn(repository, 'update');

      const command = buildCommand({
        id: 'customer-1',
        name: { firstName: 'Alice', lastName: 'Walker-Updated' },
        email: 'alice.updated@example.com',
        company: 'New Company LLC',
        city: 'Dallas',
        notes: 'Updated notes.',
        customerSocialLinks: SOCIAL_LINKS,
        updatedBy: 'user-business-owner-1',
      });

      const result = await useCase.execute(command);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeUndefined();
      }
      expect(updateSpy).toHaveBeenCalledTimes(1);

      const [savedArg] = updateSpy.mock.calls[0];
      expect(savedArg.id).toBe('customer-1');
      expect(savedArg.name).toEqual(command.name);
      expect(savedArg.email).toBe(command.email);
      expect(savedArg.company).toBe(command.company);
      expect(savedArg.city).toBe(command.city);
      expect(savedArg.notes).toBe(command.notes);
      expect(savedArg.customerSocialLinks).toEqual(command.customerSocialLinks);
      expect(savedArg.updatedBy).toBe(command.updatedBy);

      // businessId, createdAt, createdBy must be preserved, not overwritten
      expect(savedArg.businessId).toBe('business-1');

      // Persisted into the fake data store
      const persisted = CUSTOMER_TEST_DATA.find((c) => c.id === 'customer-1');
      expect(persisted?.email).toBe(command.email);
      expect(persisted?.company).toBe(command.company);
    });

    it('preserves fields not included in the update input, like businessId and createdBy', async () => {
      const before = CUSTOMER_TEST_DATA.find((c) => c.id === 'customer-1');

      await useCase.execute(buildCommand({ id: 'customer-1' }));

      const after = CUSTOMER_TEST_DATA.find((c) => c.id === 'customer-1');
      expect(after?.businessId).toBe(before?.businessId);
      expect(after?.createdBy).toBe(before?.createdBy);
      expect(after?.createdAt).toEqual(before?.createdAt);
    });
  });
});
