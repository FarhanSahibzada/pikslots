import { Provider } from '@nestjs/common';
import { AuditLogEventProcessor } from './audit.log.event.impl';

export const AUDIT_LOG_EVENTS: Provider[] = [AuditLogEventProcessor];
