import type { UserRole } from '../user';

// --- Types
export interface ServiceSnapshot {
  readonly title: string;
  readonly durationInMins: number;
  readonly cost: number;
  readonly colorCode: string;
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface BookingProps {
  readonly id: string;
  readonly bookingId: string;
  readonly bookingDate: string;
  readonly bookingStartTime: string /** ISO 8601 UTC datetime string, e.g. "2025-06-16T09:00:00.000Z" */;
  readonly bookingEndTime: string /** ISO 8601 UTC datetime string, e.g. "2025-06-16T10:00:00.000Z" */;
  readonly businessId: string;
  readonly serviceSnapshot: ServiceSnapshot;
  readonly label: string | null;
  readonly notes: string | null;

  //relations
  readonly customerId: string;
  readonly serviceId: string;
  readonly userId: string | null;

  // audit
  readonly createdAt: Date;
  readonly createdBy: string;
  readonly updatedAt: Date;
  readonly updatedBy: string;
  readonly deletedAt: Date | null;
  readonly deletedBy: string | null;
  readonly isDeleted: boolean;
}

// ── Create input ──────────────────────────────────────────────────────────────

export interface CreateBookingInput {
  id: string;
  bookingId: string;
  bookingDate: string;
  bookingStartTime: string /** ISO 8601 UTC datetime string, e.g. "2025-06-16T09:00:00.000Z" */;
  bookingEndTime: string /** ISO 8601 UTC datetime string, e.g. "2025-06-16T10:00:00.000Z" */;
  businessId: string;
  serviceId: string;
  userId: string | null;
  serviceSnapshot: ServiceSnapshot;
  customerId: string;
  createdBy: string;
  label?: string | null;
  notes?: string | null;
}

// ── Entity ────────────────────────────────────────────────────────────────────

export class Booking {
  private readonly props: BookingProps;

  private constructor(props: BookingProps) {
    this.props = props;
  }

  private static assertUtcDatetime(value: string, field: string): void {
    const date = new Date(value);
    if (isNaN(date.getTime()) || !value.endsWith('Z')) {
      throw new Error(
        `${field} must be a valid UTC ISO 8601 datetime string (e.g. "2025-06-16T09:00:00.000Z"), got: "${value}"`,
      );
    }
  }

  /**
   * Creates a brand-new Booking with audit defaults applied.
   * Use this in application use-cases, never for rehydrating persisted data.
   */
  static create(input: CreateBookingInput): Booking {
    Booking.assertUtcDatetime(input.bookingStartTime, 'bookingStartTime');
    Booking.assertUtcDatetime(input.bookingEndTime, 'bookingEndTime');
    const now = new Date();
    return new Booking({
      id: input.id,
      bookingId: input.bookingId,
      bookingDate: input.bookingDate,
      bookingStartTime: input.bookingStartTime,
      bookingEndTime: input.bookingEndTime,
      businessId: input.businessId,
      serviceId: input.serviceId,
      userId: input.userId,
      serviceSnapshot: input.serviceSnapshot,
      customerId: input.customerId,
      label: input.label ?? null,
      notes: input.notes ?? null,
      createdAt: now,
      createdBy: input.createdBy,
      updatedAt: now,
      updatedBy: input.createdBy,
      deletedAt: null,
      deletedBy: null,
      isDeleted: false,
    });
  }

  /**
   * Reconstitutes a Booking from already-validated data (e.g. a database row).
   * Never call with raw untrusted input.
   */
  static reconstitute(props: BookingProps): Booking {
    return new Booking(props);
  }

  // ── Business rules ──────────────────────────────────────────────────────────
  //
  //
  //
  //
  //
  //
  // ── Mutation methods ────────────────────────────────────────────────────────

  update(input: {
    bookingDate: string;
    bookingStartTime: string;
    bookingEndTime: string;
    serviceId: string;
    customerId: string;
    userId: string;
    updatedBy: string;
    label?: string | null;
    notes?: string | null;
  }): Booking {
    Booking.assertUtcDatetime(input.bookingStartTime, 'bookingStartTime');
    Booking.assertUtcDatetime(input.bookingEndTime, 'bookingEndTime');
    return new Booking({
      ...this.props,
      bookingDate: input.bookingDate,
      bookingStartTime: input.bookingStartTime,
      bookingEndTime: input.bookingEndTime,
      serviceId: input.serviceId,
      customerId: input.customerId,
      userId: input.userId,
      label: input.label !== undefined ? input.label : this.props.label,
      notes: input.notes !== undefined ? input.notes : this.props.notes,
      updatedAt: new Date(),
      updatedBy: input.updatedBy,
    });
  }

  softDelete(deletedBy: string): Booking {
    return new Booking({
      ...this.props,
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy,
      updatedAt: new Date(),
      updatedBy: deletedBy,
    });
  }

  // ── Booking Id Creation ──────────────────────────────────────────────────────────────

  static createUniqueBookingId(uuid: string) {
    const randomBits = parseInt(uuid.replace(/-/g, '').slice(16, 23), 16);
    return `BK${randomBits.toString(36).toUpperCase().padStart(7, '0')}`; // e.g. BK3KX9M2P
  }

  // ── Snapshot ──────────────────────────────────────────────────────────────

  toProps(): BookingProps {
    return this.props;
  }

  // ── Identity ────────────────────────────────────────────────────────────────

  get id(): string {
    return this.props.id;
  }

  equals(other: Booking): boolean {
    return this.props.id === other.props.id;
  }

  // -- Business Rules
  //
  static canRegisterBooking(
    callerRole: UserRole,
    isPartOfSameBusiness: boolean,
    isSelf: boolean,
  ): boolean {
    if (callerRole === 'Platform Owner') return true;
    if (
      (callerRole === 'Business Owner' || callerRole === 'Admin' || callerRole === 'Enhanced') &&
      isPartOfSameBusiness
    )
      return true;

    if (isPartOfSameBusiness && isSelf && callerRole === 'Standard') return true;

    // No acess
    return false;
  }

  static canViewBookings(
    callerRole: UserRole,
    isPartOfSameBusiness: boolean,
    isSelf: boolean,
  ): boolean {
    if (callerRole === 'Platform Owner') return true;
    if (
      (callerRole === 'Business Owner' || callerRole === 'Admin' || callerRole === 'Enhanced') &&
      isPartOfSameBusiness
    )
      return true;

    if (isPartOfSameBusiness && isSelf && callerRole === 'Standard') return true;

    // No acess
    return false;
  }

  static canEditBooking(
    callerRole: UserRole,
    isPartOfSameBusiness: boolean,
    isSelf: boolean,
  ): boolean {
    if (callerRole === 'Platform Owner') return true;

    if (
      (callerRole === 'Business Owner' || callerRole === 'Admin' || callerRole === 'Enhanced') &&
      isPartOfSameBusiness
    )
      return true;

    if (isPartOfSameBusiness && isSelf && callerRole === 'Standard') return true;

    // No acess
    return false;
  }

  static canDeleteBooking(
    callerRole: UserRole,
    isPartOfSameBusiness: boolean,
    isSelf: boolean,
  ): boolean {
    if (callerRole === 'Platform Owner') return true;

    if ((callerRole === 'Business Owner' || callerRole === 'Admin') && isPartOfSameBusiness)
      return true;

    // No acess
    return false;
  }

  static canViewSelfBookings(
    callerRole: UserRole,
    isPartOfSameBusiness: boolean,
    isSelf: boolean,
  ): boolean {
    if (isPartOfSameBusiness && isSelf && callerRole === 'Standard') return true;
    return false;
  }

  public isBookedForUser(userId: string | null) {
    return this.userId === userId;
  }

  // ── Core fields ─────────────────────────────────────────────────────────────

  get bookingId(): string {
    return this.props.bookingId;
  }
  get bookingDate(): string {
    return this.props.bookingDate;
  }
  get bookingStartTime(): string {
    return this.props.bookingStartTime;
  }
  get bookingEndTime(): string {
    return this.props.bookingEndTime;
  }
  get businessId(): string {
    return this.props.businessId;
  }
  get serviceId(): string {
    return this.props.serviceId;
  }
  get customerId(): string {
    return this.props.customerId;
  }
  get serviceSnapshot(): ServiceSnapshot {
    return this.props.serviceSnapshot;
  }
  get userId(): string | null {
    return this.props.userId;
  }
  get label(): string | null {
    return this.props.label;
  }
  get notes(): string | null {
    return this.props.notes;
  }
  // ── Audit fields ─────────────────────────────────────────────────────────────

  get createdAt(): Date {
    return this.props.createdAt;
  }
  get createdBy(): string {
    return this.props.createdBy;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
  get updatedBy(): string {
    return this.props.updatedBy;
  }
  get deletedAt(): Date | null {
    return this.props.deletedAt;
  }
  get deletedBy(): string | null {
    return this.props.deletedBy;
  }
  get isDeleted(): boolean {
    return this.props.isDeleted;
  }
}
