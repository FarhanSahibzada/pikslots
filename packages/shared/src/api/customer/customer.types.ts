// --- Shared sub-types ---

export type CustomerSocialLinks = Record<string, string>;

// --- Requests ---

export interface RegisterCustomerInput {
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  email: string | null;
  additionalEmail: string | null;
  primaryPhone: string | null;
  additionalPhone: string | null;
  company: string | null;
  country: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  notes: string | null;
  customerSocialLinks: CustomerSocialLinks;
  additionalFields?: Record<string, string> | null;
  businessId: string;
}

export interface EditCustomerInput {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  email: string | null;
  additionalEmail: string | null;
  primaryPhone: string | null;
  additionalPhone: string | null;
  company: string | null;
  country: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  notes: string | null;
  customerSocialLinks: CustomerSocialLinks;
  businessId: string;
}

export interface DebounceCustomerSearchByBusinessRequest {
  searchString: string;
}

// --- Responses ---
export interface PartialCustomerResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  profileImageUrl: string | null;
}

export interface FullCustomerResponse {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  email: string | null;
  additionalEmail: string | null;
  primaryPhone: string | null;
  additionalPhone: string | null;
  company: string | null;
  country: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  notes: string | null;
  customerSocialLinks: CustomerSocialLinks;
  additionalFields: Record<string, string> | null;
  businessId: string;
}

export interface RegisterCustomerResponse {
  message: 'success';
}

export type FindAllCustomersByBusinessResponse = PartialCustomerResponse[];

export type DebounceCustomerSearchByBusinessResponse = PartialCustomerResponse[];

export interface EditCustomerResponse {
  message: 'success';
}

export interface DeleteCustomerResponse {
  message: 'success';
}

export type FindCustomerByIdResponse = FullCustomerResponse;

export interface UpdateCustomerProfileImageInput {
  profileImageKey: string;
}

export interface UpdateCustomerProfileImageResponse {
  message: 'success';
}
