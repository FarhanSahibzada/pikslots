import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import {
  Class,
  ClassNotFoundError,
  DeleteClassUseCase,
  err,
  IClassRepository,
  InfrastructureError,
  ok,
  Result,
} from '@pikslots/domain';
import type {
  AuditLogJobDataShape,
  ClassRepository,
  UnauthorizedError,
} from '@pikslots/domain';
import { Queue } from 'bullmq';
import { SecurityContext } from 'src/shared/security/context/security.context';
import {
  AUDIT_LOG_QUEUE,
  PIKSLOT_EVENTS,
} from 'src/shared/queue/jobs/pikslot.events';
import type { AuditLogJobName } from 'src/shared/queue/jobs';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'Can not register service : unauthorized!!!',
  timestamp: new Date(),
};

const CLASS_NOT_FOUND_ERROR: ClassNotFoundError = {
  kind: 'class_not_found',
  by: 'id',
  message: `Class not found`,
  value: 'Class not found',
  timestamp: new Date(),
};

@Injectable()
export class DeleteClassUseCaseImpl implements DeleteClassUseCase {
  constructor(
    @Inject(IClassRepository)
    private readonly classRepository: ClassRepository,
    private readonly securityContext: SecurityContext,
    @InjectQueue(AUDIT_LOG_QUEUE)
    private readonly auditLogQueue: Queue<
      AuditLogJobDataShape,
      void,
      AuditLogJobName
    >,
  ) {}

  async execute(
    id: string,
  ): Promise<
    Result<void, ClassNotFoundError | UnauthorizedError | InfrastructureError>
  > {
    const classFound = await this.classRepository.findById(id);

    if (!classFound.ok) return err(classFound.error);

    if (!classFound.value) return err(CLASS_NOT_FOUND_ERROR);

    const callerRole = this.securityContext.role;
    const callerBusinessId = this.securityContext.businessId;
    const isPartOfSameBusiness =
      callerBusinessId === classFound.value.businessId;

    if (!Class.canDeleteClass(callerRole, isPartOfSameBusiness))
      return err(UNAUTHORIZED_ERROR);

    const result = await this.classRepository.delete(id);

    if (!result.ok) return err(result.error);

    await this.logClassDeletedAudit(classFound.value);

    return ok(result.value);
  }

  private async logClassDeletedAudit(cls: Class): Promise<void> {
    const payload: AuditLogJobDataShape = {
      businessId: cls.businessId,
      userId: this.securityContext.userId,
      userType: 'user',
      action: PIKSLOT_EVENTS.AUDIT_LOG.CLASS_DELETED,
      description: `Class '${cls.title}' was deleted`,
      entityType: 'class',
      entityId: cls.id,
      occurredAt: new Date().toISOString(),
    };

    await this.auditLogQueue.add(
      PIKSLOT_EVENTS.AUDIT_LOG.CLASS_DELETED,
      payload,
    );
  }
}
