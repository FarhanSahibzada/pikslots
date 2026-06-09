// --- Requests ---

export interface CreateServiceGroupInput {
  name: string;
  businessId: string;
}

// --- Responses ---

export interface ServiceGroupResponse {
  id: string;
  name: string;
  businessId: string;
}

export type FindAllServiceGroupsByBusinessResponse = ServiceGroupResponse[];
