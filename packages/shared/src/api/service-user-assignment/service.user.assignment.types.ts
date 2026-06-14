// --- Requests ---

export interface AssignUserToServiceInput {
  serviceId: string;
  userId: string;
  businessId: string;
}

// --- Responses ---

export interface ServiceUserAssignmentResponse {
  id: string;
  serviceId: string;
  userId: string;
  businessId: string;
}

export interface UserNameResponse {
  id: string;
  firstName: string;
  lastName: string;
}

export interface ServiceTitleResponse {
  id: string;
  title: string;
}
