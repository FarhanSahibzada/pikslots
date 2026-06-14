import { Provider } from '@nestjs/common';
import { SyncClassGroupClassesEventImpl } from './sync.class.group.classes.event.impl';
import { SyncClassClassGroupsEventImpl } from './sync.class.class.groups.event.impl';

export const CLASS_GROUP_ASSIGNMENT_EVENTS: Provider[] = [
  SyncClassGroupClassesEventImpl,
  SyncClassClassGroupsEventImpl,
];
