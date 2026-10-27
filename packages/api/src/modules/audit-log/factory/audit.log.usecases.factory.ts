import { Inject, Injectable } from '@nestjs/common';
import { IFindAuditLogsUseCase } from '@pikslots/domain';
import type { FindAuditLogsUseCase } from '@pikslots/domain';

@Injectable()
export class AuditLogUsecasesFactory {
  @Inject(IFindAuditLogsUseCase)
  public readonly findAuditLogsUsecase: FindAuditLogsUseCase;
}
