// --- Requests ---

export interface RegisterClassInput {
  title: string;
  description: string;
  imagesUrls: string[];
  durationInMins: number;
  seats: number;
  cost: number;
  businessId: string;
  isHiddenFromBookingPage: boolean;
  associatedClassGroupIds: string[];
}

export interface UpdateClassInput {
  id: string;
  title: string;
  description: string;
  imagesUrls: string[];
  durationInMins: number;
  seats: number;
  cost: number;
  isHiddenFromBookingPage: boolean;
  associatedClassGroupIds: string[];
  businessId: string;
}

// --- Responses ---

export interface RegisterClassResponse {
  message: 'success';
}

export interface ClassResponse {
  id: string;
  title: string;
  description: string;
  images: string[];
  durationInMins: number;
  seats: number;
  cost: number;
  isHiddenFromBookingPage: boolean;
  businessId: string;
}

export type FindAllClassesByBusinessResponse = ClassResponse[];

export interface UpdateClassResponse {
  message: 'success';
}

export interface DeleteClassResponse {
  message: 'success';
}
