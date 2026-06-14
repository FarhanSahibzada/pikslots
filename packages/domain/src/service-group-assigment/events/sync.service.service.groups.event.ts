// (single) service --> sync --> service groups (multiple)
export interface SyncServiceServiceGroupsEvent {
  serviceId: string;
  serviceGroupIds: string[];
  businessId: string;
  assignedBy: string;
}
