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

// --- Responses ---

export interface CustomerResponse {
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

export interface RegisterCustomerResponse {
  message: 'success';
}

export type FindAllCustomersByBusinessResponse = CustomerResponse[];

export interface EditCustomerResponse {
  message: 'success';
}

export interface DeleteCustomerResponse {
  message: 'success';
}
