// --- Responses ---

export interface ClassNameResponse {
  id: string;
  name: string;
}

export type FindClassesByGroupResponse = ClassNameResponse[];

export interface ClassGroupNameResponse {
  id: string;
  name: string;
}
