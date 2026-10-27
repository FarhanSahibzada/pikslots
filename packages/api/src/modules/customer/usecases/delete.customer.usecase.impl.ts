import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  ok,
  Customer,
  CustomerNotFoundError,
  DeleteCustomerCommand,
  DeleteCustomerUseCase,
  type AuditLogJobDataShape,
  type CustomerRepository,
  ICustomerRepository,
  InfrastructureError,
  Result,
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
  message: 'Can not delete customer : unauthorized!!!',
  timestamp: new Date(),
};

@Injectable()
export class DeleteCustomerUseCaseImpl implements DeleteCustomerUseCase {
  constructor(
    @Inject(ICustomerRepository)
    private readonly customerRepository: CustomerRepository,
    private readonly securityContext: SecurityContext,
    @InjectQueue(AUDIT_LOG_QUEUE)
    private readonly auditLogQueue: Queue<
      AuditLogJobDataShape,
      void,
      AuditLogJobName
    >,
  ) {}

  async execute(
    command: DeleteCustomerCommand,
  ): Promise<
    Result<
      void,
      CustomerNotFoundError | UnauthorizedError | InfrastructureError
    >
  > {
    const found = await this.customerRepository.findById(command.id);

    if (!found.ok) return err(found.error);

    if (!found.value) {
      return err({
        kind: 'customer_not_found',
        message: `Customer not found by id: ${command.id}`,
        timestamp: new Date(),
        by: 'id',
        value: command.id,
      } satisfies CustomerNotFoundError);
    }

    const callerRole = this.securityContext.role;
    const callerBusinessId = this.securityContext.businessId;
    const isPartOfSameBusiness = callerBusinessId === found.value.businessId;

    if (!Customer.canDeleteCustomer(callerRole, isPartOfSameBusiness))
      return err(UNAUTHORIZED_ERROR);

    const softDeleted = found.value.softDelete(command.deletedBy);

    const saved = await this.customerRepository.update(softDeleted);

    if (!saved.ok) return err(saved.error);

    await this.logCustomerDeletedAudit(softDeleted);

    return ok(undefined);
  }

  private async logCustomerDeletedAudit(customer: Customer): Promise<void> {
    const payload: AuditLogJobDataShape = {
      businessId: customer.businessId,
      userId: this.securityContext.userId,
      userType: 'user',
      action: PIKSLOT_EVENTS.AUDIT_LOG.CUSTOMER_DELETED,
      description: `Customer '${customer.name.firstName} ${customer.name.lastName}' was deleted`,
      entityType: 'customer',
      entityId: customer.id,
      occurredAt: new Date().toISOString(),
    };

    await this.auditLogQueue.add(
      PIKSLOT_EVENTS.AUDIT_LOG.CUSTOMER_DELETED,
      payload,
    );
  }
}
