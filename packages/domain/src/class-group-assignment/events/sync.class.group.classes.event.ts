// (single) class group --> sync --> classes (multiple)
export interface SyncClassGroupClassesEvent {
  classGroupId: string;
  classIds: string[];
  businessId: string;
  assignedBy: string;
}
