import type {
  BookingContactFields,
  BookingCustomization,
  BookingLabelOverrides,
  BookingPolicies,
  BookingSetup,
  BrandAppearanceDetails,
  BrandDetails,
  BusinessContactDetails,
  BusinessHours,
  BusinessLinks,
  LocationDetails,
} from '../business';

// _________Responses__________________________________________

export interface BusinessDetails {
  id: string;
  name: string;
  slug: string;
  about: string;
  brandDetail: BrandDetails;
  brandApperanceDetails: BrandAppearanceDetails;
  bookingPolicies: BookingPolicies;
  locationDetails: LocationDetails;
  bookingSetup: BookingSetup;
  bookingContactFields: BookingContactFields;
  bookingCustomization: BookingCustomization;
  bookingLabelOverrides: BookingLabelOverrides;
  businessHours: BusinessHours;
  businessLinks: BusinessLinks;
  contactDetails: BusinessContactDetails;
}
export interface Service {
  id: string;
  title: string;
  description: string;
  serviceAvatar: string;
  durationInMins: number;
  bufferTimeInMins: number;
  cost: number;
  isHiddenFromBookingPage: boolean;
  colorCode: string;
}

export interface ServiceGroups {
  id: string;
  name: string;
  services: Service[];
}

export type ServicesDetails = {
  groups: ServiceGroups[];
  services: Service[];
};

export interface TeamMemberDetails {
  id: string;
  name: { firstName: string; lastName: string };
  avatarUrl: string | null;
  role: string;
  serviceIds: string[] | null;
}

export interface PublicBookingPageDetails {
  business: BusinessDetails;
  services: ServicesDetails;
  teamMembers: TeamMemberDetails[];
}

// --- Public booking (unauthenticated guest) ---

export interface PublicBookingContact {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  customFields?: Record<string, string>;
}

export interface RegisterPublicBookingRequest {
  businessId: string;
  serviceId: string;
  userId: string;
  bookingDate: string; // 'YYYY-MM-DD'
  bookingStartTime: string; // ISO 8601 UTC
  bookingEndTime: string; // ISO 8601 UTC
  contact: PublicBookingContact;
  termsAccepted?: boolean;
}

export interface RegisterPublicBookingResponse {
  message: 'success';
  bookingId: string; // human-readable reference e.g. "BK3KX9M2P"
}
