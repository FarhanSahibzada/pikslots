// (single) service group --> sync  --> services (multiple)
export interface SyncServiceGroupServicesEvent {
  serviceGroupId: string;
  serviceIds: string[];
  businessId: string;
  assignedBy: string;
}
