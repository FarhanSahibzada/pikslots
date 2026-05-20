export type BusinessIndustry =
  | 'salon_and_beauty'
  | 'health_and_wellness'
  | 'fitness'
  | 'medical'
  | 'education'
  | 'legal'
  | 'financial'
  | 'hospitality'
  | 'retail'
  | 'other';

// --- Requests ---

export interface RegisterBusinessInput {
  ownerId: string;
  slug: string;
  name: string;
  industry: BusinessIndustry;
  address: string;
  email: string;
  phone?: string;
  description?: string;
  website?: string;
  defaultTimeZone?: string;
  defaultCurrency?: string;
  defaultLanguage?: string;
}

// --- Responses ---

export interface RegisterBusinessResponse {
  message: 'success';
}

export interface BusinessSummary {
  id: string;
  name: string;
  slug: string;
  email: string;
  industry: BusinessIndustry;
  status: string;
  subscriptionPlan: string;
  createdAt: Date;
}

export type GetAllBusinessesResponse = BusinessSummary[];
