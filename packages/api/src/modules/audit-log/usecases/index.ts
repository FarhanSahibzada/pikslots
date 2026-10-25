import { Provider } from '@nestjs/common';
import { IFindAuditLogsUseCase, IRegisterAuditLogUseCase } from '@pikslots/domain';
import { RegisterAuditLogUseCaseImpl } from './register.audit.log.usecase.impl';
import { FindAuditLogsUseCaseImpl } from './find.audit.logs.usecase.impl';

export const AUDIT_LOG_USECASES: Provider[] = [
  {
    useClass: RegisterAuditLogUseCaseImpl,
    provide: IRegisterAuditLogUseCase,
  },
  {
    useClass: FindAuditLogsUseCaseImpl,
    provide: IFindAuditLogsUseCase,
  },
];
