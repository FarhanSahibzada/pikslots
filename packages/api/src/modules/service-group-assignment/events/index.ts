import { Provider } from '@nestjs/common';
import { SyncServiceGroupServicesEventImpl } from './sync.service.group.services.event.impl';
import { SyncServiceServiceGroupsEventImpl } from './sync.service.service.groups.event.impl';

export const SERVICE_GROUP_ASSIGNMENT_EVENTS: Provider[] = [
  SyncServiceGroupServicesEventImpl,
  SyncServiceServiceGroupsEventImpl,
];
