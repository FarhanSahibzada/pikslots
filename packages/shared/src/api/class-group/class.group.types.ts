// --- Requests ---

export interface RegisterClassGroupInput {
  name: string;
  businessId: string;
  associatedClasses: string[];
}

export interface EditClassGroupInput {
  name: string;
  businessId: string;
  classIds: string[];
}

// --- Responses ---

export interface ClassGroupResponse {
  id: string;
  name: string;
  businessId: string;
}

export interface RegisterClassGroupResponse {
  message: 'success';
}
