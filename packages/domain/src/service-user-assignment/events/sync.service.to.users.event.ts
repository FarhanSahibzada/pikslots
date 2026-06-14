// (single) service --> sync --> users (multiple)
export interface SyncServiceToUsersEvent {
  serviceId: string;
  userIds: string[];
  businessId: string;
  assignedBy: string;
}
