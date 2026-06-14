import { Provider } from '@nestjs/common';
import { SyncServiceToUsersEventImpl } from './sync.service.to.users.event.impl';

export const SERVICE_USER_ASSIGNMENT_EVENTS: Provider[] = [
  SyncServiceToUsersEventImpl,
];
