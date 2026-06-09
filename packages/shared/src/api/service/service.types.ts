// --- Requests ---

export interface RegisterServiceInput {
  title: string;
  description: string;
  imagesUrls: string[];
  durationInMins: number;
  bufferTimeInMins: number;
  cost: number;
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
