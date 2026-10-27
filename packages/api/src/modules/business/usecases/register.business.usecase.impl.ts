import { Inject, Injectable } from '@nestjs/common';
import {
  Business,
  BusinessAlreadyExistsError,
  IBusinessRepository,
  InfrastructureError,
  RegisterBusinessUseCase,
  CreateBusinessCommand,
  Result,
  err,
  ok,
} from '@pikslots/domain';
import { v7 as uuidv7 } from 'uuid';
import type {
  AuditLogJobDataShape,
  BusinessRegistrationInviteEvent,
  BusinessRepository,
} from '@pikslots/domain';
import { InjectQueue } from '@nestjs/bullmq';
import {
  AUDIT_LOG_QUEUE,
  PIKSLOT_EVENTS,
} from 'src/shared/queue/jobs/pikslot.events';
import type { AuditLogJobName } from 'src/shared/queue/jobs';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/shared/config/env';
import { InviteJwtPayload } from '@pikslots/shared';
import { JwtInviteService } from 'src/shared/security/jwt/jwt.invite.service';

@Injectable()
export class RegisterBusinessUseCaseImpl implements RegisterBusinessUseCase {
  constructor(
    @Inject(IBusinessRepository)
    private readonly businessRepository: BusinessRepository,
    @InjectQueue(PIKSLOT_EVENTS.BUSINESS.BUSINESS_REGISTRATION_INVITE)
    private events: Queue<
      BusinessRegistrationInviteEvent,
      void,
      typeof PIKSLOT_EVENTS.BUSINESS.BUSINESS_REGISTRATION_INVITE
    >,
    private readonly configService: ConfigService<Env, true>,
    private readonly jwtInviteService: JwtInviteService,
    @InjectQueue(AUDIT_LOG_QUEUE)
    private readonly auditLogQueue: Queue<
      AuditLogJobDataShape,
      void,
      AuditLogJobName
    >,
  ) {}

  async execute(
    command: CreateBusinessCommand,
  ): Promise<
    Result<
      { message: 'success' },
      BusinessAlreadyExistsError | InfrastructureError
    >
  > {
    const business: Business = Business.create({
      id: uuidv7(),
      ownerId: command.ownerId,
      slug: command.slug,
      name: command.name,
      industry: command.industry,
      defaultTimeZone: command.defaultTimeZone,
      createdBy: command.ownerId,
    });

    const result = await this.businessRepository.save(business);

    if (!result.ok) {
      return err(result.error);
    }

    const inviteURL = this.buildInviteUrl(command.ownerId, business.id);

    await this.events.add(
      PIKSLOT_EVENTS.BUSINESS.BUSINESS_REGISTRATION_INVITE,
      {
        businessId: business.id,
        businessOwnerId: business.ownerId,
        businessName: business.name,
        businessOnwerName: command.ownerName,
        businessOwnerEmail: command.ownerEmail,
        inviteURL,
      },
    );

    await this.logBusinessRegisteredAudit(business);

    return ok({ message: 'success' });
  }

  private async logBusinessRegisteredAudit(business: Business): Promise<void> {
    const payload: AuditLogJobDataShape = {
      businessId: business.id,
      userId: business.ownerId,
      userType: 'user',
      action: PIKSLOT_EVENTS.AUDIT_LOG.BUSINESS_REGISTERED,
      description: `Business '${business.name}' was registered`,
      entityType: 'business',
      entityId: business.id,
      occurredAt: new Date().toISOString(),
    };

    await this.auditLogQueue.add(
      PIKSLOT_EVENTS.AUDIT_LOG.BUSINESS_REGISTERED,
      payload,
    );
  }

  private buildInviteUrl(userId: string, businessId: string): string {
    const token = this.jwtInviteService.signInviteToken<InviteJwtPayload>({
      userId,
      businessId,
    });

    const frontendUrl = this.configService.getOrThrow('FRONTEND_PUBLIC_URL', {
      infer: true,
    });
    return `${frontendUrl}/user-invite?jid=${token}`;
  }
}
