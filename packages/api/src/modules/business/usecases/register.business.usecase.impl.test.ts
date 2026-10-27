import { getQueueToken } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bullmq';
import {
  Business,
  BusinessAlreadyExistsError,
  CreateBusinessCommand,
  err,
  IBusinessRepository,
  InfrastructureError,
} from '@pikslots/domain';
import { RegisterBusinessUseCaseImpl } from './register.business.usecase.impl';
import { BusinessRepositoryTestImpl } from '../repository/business.repository.fake.impl';
import { JwtInviteService } from 'src/shared/security/jwt/jwt.invite.service';
import {
  AUDIT_LOG_QUEUE,
  PIKSLOT_EVENTS,
} from 'src/shared/queue/jobs/pikslot.events';
import { BUSINESS_TEST_DATA } from '../repository/business.fake.data';

jest.mock('uuid', () => ({
  v7: () => 'mock-generated-id',
}));

function buildCommand(
  overrides: Partial<CreateBusinessCommand> = {},
): CreateBusinessCommand {
  return {
    ownerId: 'user-new-owner-1',
    ownerName: 'Jordan Smith',
    ownerEmail: 'jordan.smith@example.com',
    slug: 'jordans-new-studio',
    name: "Jordan's New Studio",
    industry: 'fitness',
    defaultTimeZone: 'America/New_York',
    ...overrides,
  };
}

describe('RegisterBusinessUseCaseImpl', () => {
  let useCase: RegisterBusinessUseCaseImpl;
  let repository: BusinessRepositoryTestImpl;
  let queue: jest.Mocked<Queue>;
  let addSpy: jest.SpyInstance;
  let configService: jest.Mocked<ConfigService>;
  let jwtInviteService: jest.Mocked<JwtInviteService>;
  let originalData: Business[];

  beforeEach(async () => {
    if (!originalData) originalData = [...BUSINESS_TEST_DATA];
    BUSINESS_TEST_DATA.length = 0;
    BUSINESS_TEST_DATA.push(...originalData);

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterBusinessUseCaseImpl,
        {
          provide: IBusinessRepository,
          useClass: BusinessRepositoryTestImpl,
        },
        {
          provide: getQueueToken(
            PIKSLOT_EVENTS.BUSINESS.BUSINESS_REGISTRATION_INVITE,
          ),
          useValue: { add: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest
              .fn()
              .mockReturnValue('https://app.pikslots.example.com'),
          },
        },
        {
          provide: JwtInviteService,
          useValue: {
            signInviteToken: jest.fn().mockReturnValue('mock-invite-jwt'),
          },
        },
        {
          provide: getQueueToken(AUDIT_LOG_QUEUE),
          useValue: { add: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    useCase = moduleRef.get(RegisterBusinessUseCaseImpl);
    repository = moduleRef.get(IBusinessRepository);
    queue = moduleRef.get(
      getQueueToken(PIKSLOT_EVENTS.BUSINESS.BUSINESS_REGISTRATION_INVITE),
    );
    configService = moduleRef.get(ConfigService);
    jwtInviteService = moduleRef.get(JwtInviteService);
    // Captured once here so assertions reference plain variables instead of
    // bare `queue.add` property access, which trips
    // @typescript-eslint/unbound-method on jest mocks.
    addSpy = jest.spyOn(queue, 'add');
  });

  describe('repository failures', () => {
    it('propagates a BusinessAlreadyExistsError when the slug is already taken', async () => {
      // business-1's fixture slug is 'alices-salon-and-spa'
      const result = await useCase.execute(
        buildCommand({ slug: 'alices-salon-and-spa' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as BusinessAlreadyExistsError).kind).toBe(
          'business_already_exists',
        );
      }
      expect(addSpy).not.toHaveBeenCalled();
    });

    it('propagates an InfrastructureError from save', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to save business',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest.spyOn(repository, 'save').mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
      expect(addSpy).not.toHaveBeenCalled();
    });
  });

  describe('successful registration', () => {
    it('builds and saves a Business entity matching the command', async () => {
      const command = buildCommand({
        ownerId: 'user-new-owner-1',
        slug: 'jordans-new-studio',
        name: "Jordan's New Studio",
        industry: 'fitness',
        defaultTimeZone: 'America/New_York',
      });

      const result = await useCase.execute(command);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ message: 'success' });
      }

      const persisted = BUSINESS_TEST_DATA.find(
        (b) => b.id === 'mock-generated-id',
      );
      expect(persisted).toBeDefined();
      expect(persisted?.ownerId).toBe(command.ownerId);
      expect(persisted?.slug).toBe(command.slug);
      expect(persisted?.name).toBe(command.name);
      expect(persisted?.industry).toBe(command.industry);
      expect(persisted?.createdBy).toBe(command.ownerId);
      // Business.create() defaults
      expect(persisted?.status).toBe('pending_setup');
      expect(persisted?.subscriptionStatus).toBe('trialing');
      expect(persisted?.isDeleted).toBe(false);
    });

    it('builds the invite URL from the JWT invite token and configured frontend URL', async () => {
      const command = buildCommand({ ownerId: 'user-new-owner-1' });

      await useCase.execute(command);

      expect(jwtInviteService.signInviteToken).toHaveBeenCalledWith({
        userId: command.ownerId,
        businessId: 'mock-generated-id',
      });
      expect(configService.getOrThrow).toHaveBeenCalledWith(
        'FRONTEND_PUBLIC_URL',
        { infer: true },
      );

      const [, payload] = addSpy.mock.calls[0] as [
        string,
        { inviteURL: string },
      ];
      expect(payload.inviteURL).toBe(
        'https://app.pikslots.example.com/user-invite?jid=mock-invite-jwt',
      );
    });

    it('enqueues a registration invite job with the correct payload', async () => {
      const command = buildCommand({
        ownerId: 'user-new-owner-1',
        ownerName: 'Jordan Smith',
        ownerEmail: 'jordan.smith@example.com',
        name: "Jordan's New Studio",
      });

      await useCase.execute(command);

      expect(addSpy).toHaveBeenCalledTimes(1);
      expect(addSpy).toHaveBeenCalledWith(
        PIKSLOT_EVENTS.BUSINESS.BUSINESS_REGISTRATION_INVITE,
        {
          businessId: 'mock-generated-id',
          businessOwnerId: command.ownerId,
          businessName: command.name,
          businessOnwerName: command.ownerName,
          businessOwnerEmail: command.ownerEmail,
          inviteURL:
            'https://app.pikslots.example.com/user-invite?jid=mock-invite-jwt',
        },
      );
    });
  });
});
