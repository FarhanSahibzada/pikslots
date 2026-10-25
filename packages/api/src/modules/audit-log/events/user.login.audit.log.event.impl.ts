import { Inject } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { AuditLog, IAuditLogRepository } from '@pikslots/domain';
import type { AuditLogRepository } from '@pikslots/domain';
import { AuditLogJob } from 'src/shared/queue/jobs';
import { PIKSLOT_EVENTS } from 'src/shared/queue/jobs/pikslot.events';
import { v7 as uuidv7 } from 'uuid';

@Processor(PIKSLOT_EVENTS.AUDIT_LOG.USER_LOGIN)
export class UserLoginAuditLogEventImpl extends WorkerHost {
  constructor(
    @Inject(IAuditLogRepository)
    private readonly auditLogRepository: AuditLogRepository,
  ) {
    super();
  }

  async process(job: AuditLogJob): Promise<void> {
    const auditLog = AuditLog.create({ id: uuidv7(), ...job.data });

    const saved = await this.auditLogRepository.save(auditLog);

    if (!saved.ok) throw new Error(JSON.stringify(saved.error));
  }
}
