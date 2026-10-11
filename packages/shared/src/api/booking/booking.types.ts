// --- Shared value types ---

export interface ServiceSnapshotResponse {
  title: string;
  durationInMins: number;
  cost: number;
  colorCode: string;
}

// --- Request types ---

export interface ServiceSnapshotRequest {
  title: string;
  durationInMins: number;
  cost: number;
  colorCode: string;
}

export interface RegisterBookingRequest {
  bookingDate: string;
  bookingStartTime: string;
  bookingEndTime: string;
  businessId: string;
  serviceId: string;
  userId: string;
  customerId: string;
  serviceSnapshot: ServiceSnapshotRequest;
  label?: string;
  notes?: string;
}

// --- Response types ---

export interface RegisterBookingResponse {
  message: 'success';
}

export interface BookingItemResponse {
  id: string;
  bookingId: string;
  bookingDate: string;
  bookingStartTime: string;
  bookingEndTime: string;
  userId: string | null;
  serviceSnapshot: ServiceSnapshotResponse;
  serviceId: string;
  customerId: string;
  label: string | null;
  notes: string | null;
}

export type FindAllBookingsByBusinessForUserResponse = BookingItemResponse[];

export interface FindBookingByIdResponse {
  id: string;
  bookingId: string;
  bookingDate: string;
  bookingStartTime: string;
  bookingEndTime: string;
  businessId: string;
  serviceSnapshot: ServiceSnapshotResponse;
  serviceId: string;
  customerId: string;
  userId: string | null;
  label: string | null;
  notes: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  deletedAt: string | null;
  deletedBy: string | null;
  isDeleted: boolean;
}

export interface EditBookingRequest {
  bookingDate: string;
  bookingStartTime: string;
  bookingEndTime: string;
  serviceId: string;
  customerId: string;
  userId: string;
  label?: string;
  notes?: string;
}

export interface EditBookingResponse {
  message: 'success';
}

export interface DeleteBookingResponse {
  message: 'success';
}
