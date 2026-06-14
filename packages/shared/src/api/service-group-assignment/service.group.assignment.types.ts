// --- Responses ---

export interface ServiceNameResponse {
  id: string;
  name: string;
}

export type FindServicesByGroupResponse = ServiceNameResponse[];

export interface ServiceGroupNameResponse {
  id: string;
  name: string;
}
