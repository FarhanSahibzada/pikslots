// --- Requests ---

export interface RegisterServiceInput {
  title: string;
  description: string;
  imagesUrls: string[];
  durationInMins: number;
  bufferTimeInMins: number;
  cost: number;
  businessId: string;
  isHiddenFromBookingPage: boolean;
  associatedUsers: string[];
  associatedServiceGroups: string[];
}

// --- Responses ---

export interface RegisterServiceResponse {
  message: 'success';
}

export interface ServiceResponse {
  id: string;
  title: string;
  description: string;
  images: string[];
  durationInMins: number;
  bufferTimeInMins: number;
  cost: number;
  isHiddenFromBookingPage: boolean;
  businessId: string;
}

export type FindAllServicesByBusinessResponse = ServiceResponse[];

export interface UpdateServiceInput {
  id: string;
  title: string;
  description: string;
  imagesUrls: string[];
  durationInMins: number;
  bufferTimeInMins: number;
  cost: number;
  isHiddenFromBookingPage: boolean;
  associatedUsers: string[];
  associatedServiceGroups: string[];
  businessId: string;
}

export interface UpdateServiceResponse {
  message: 'success';
}

export interface DeleteServiceResponse {
  message: 'success';
}
