// (single) class --> sync --> class groups (multiple)
export interface SyncClassClassGroupsEvent {
  classId: string;
  classGroupIds: string[];
  businessId: string;
  assignedBy: string;
}
