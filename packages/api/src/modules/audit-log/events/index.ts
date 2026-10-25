import { Provider } from '@nestjs/common';
import { UserLoginAuditLogEventImpl } from './user.login.audit.log.event.impl';
import { UserLogoutAuditLogEventImpl } from './user.logout.audit.log.event.impl';

export const AUDIT_LOG_EVENTS: Provider[] = [
  UserLoginAuditLogEventImpl,
  UserLogoutAuditLogEventImpl,
];
