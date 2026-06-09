// --- Requests ---

export interface AssignServiceToGroupInput {
  serviceId: string;
  serviceGroupId: string;
  businessId: string;
}

// --- Responses ---

export interface ServiceGroupAssignmentResponse {
  id: string;
  serviceId: string;
  serviceGroupId: string;
  businessId: string;
}

export type FindServicesByGroupResponse = ServiceGroupAssignmentResponse[];
