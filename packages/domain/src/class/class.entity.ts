// ── Props ─────────────────────────────────────────────────────────────────────

import type { UserRole } from '../user';

export interface ClassProps {
  readonly id: string;
  readonly title: string; // should be unique per business
  readonly description: string;
  readonly images: string[]; // only 5 images allowed
  readonly durationInMins: number;
  readonly seats: number;
  readonly cost: number;
  readonly isHiddenFromBookingPage: boolean;
  readonly businessId: string;
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

export interface ClassCreateInput {
  id: string;
  title: string;
  description: string;
  imagesUrls: string[]; // only 5 images allowed
  durationInMins: number;
  seats: number;
  isHiddenFromBookingPage: boolean;
  cost: number;
  businessId: string;
  createdBy: string;
}

// ── Entity ────────────────────────────────────────────────────────────────────

export class Class {
  private readonly props: ClassProps;

  private constructor(props: ClassProps) {
    this.props = props;
  }

  /**
   * Creates a brand-new Class with defaults applied.
   * Use this in application use-cases, never for rehydrating persisted data.
   */
  static create(input: ClassCreateInput): Class {
    const now = new Date();
    return new Class({
      id: input.id,
      title: input.title,
      description: input.description,
      images: input.imagesUrls,
      durationInMins: input.durationInMins,
      seats: input.seats,
      cost: input.cost,
      isHiddenFromBookingPage: input.isHiddenFromBookingPage,
      businessId: input.businessId,
      createdAt: now,
      createdBy: input.createdBy,
      updatedAt: now,
      updatedBy: input.createdBy,
      deletedAt: null,
      deletedBy: null,
      isDeleted: false,
    });
  }

  update(input: {
    title: string;
    description: string;
    imagesUrls: string[];
    durationInMins: number;
    cost: number;
    seats: number;
    isHiddenFromBookingPage: boolean;
    updatedBy: string;
  }): Class {
    return new Class({
      ...this.props,
      title: input.title,
      description: input.description,
      images: input.imagesUrls,
      durationInMins: input.durationInMins,
      seats: input.seats,
      cost: input.cost,
      isHiddenFromBookingPage: input.isHiddenFromBookingPage,
      updatedAt: new Date(),
      updatedBy: input.updatedBy,
    });
  }

  static canRegisterClass(callerRole: UserRole, isPartOfSameBusiness: boolean): boolean {
    if (callerRole === 'Platform Owner') return true;
    if ((callerRole === 'Business Owner' || callerRole === 'Admin') && isPartOfSameBusiness)
      return true;

    // Enhanced , Standard , No acess
    return false;
  }

  static canEditClass(callerRole: UserRole, isPartOfSameBusiness: boolean): boolean {
    if (callerRole === 'Platform Owner') return true;
    if ((callerRole === 'Business Owner' || callerRole === 'Admin') && isPartOfSameBusiness)
      return true;

    // Enhanced , Standard , No acess
    return false;
  }

  static canDeleteClass(callerRole: UserRole, isPartOfSameBusiness: boolean): boolean {
    if (callerRole === 'Platform Owner') return true;
    if ((callerRole === 'Business Owner' || callerRole === 'Admin') && isPartOfSameBusiness)
      return true;

    // Enhanced , Standard , No acess
    return false;
  }
  /**
   * Reconstitutes a Class from already-validated data (e.g. a database row
   * decoded through ServiceSchema). Never call with raw untrusted input.
   */
  static reconstitute(props: ClassProps): Class {
    return new Class(props);
  }

  // ── Identity ───────────────────────────────────────────────────────────────

  get id(): string {
    return this.props.id;
  }

  equals(other: Class): boolean {
    return this.props.id === other.props.id;
  }

  // ── Core fields ────────────────────────────────────────────────────────────

  get title(): string {
    return this.props.title;
  }
  get description(): string {
    return this.props.description;
  }
  get images(): string[] {
    return this.props.images;
  }
  get durationInMins(): number {
    return this.props.durationInMins;
  }
  get seats(): number {
    return this.props.seats;
  }
  get cost(): number {
    return this.props.cost;
  }
  get isHiddenFromBookingPage(): boolean {
    return this.props.isHiddenFromBookingPage;
  }
  get businessId(): string {
    return this.props.businessId;
  }

  // ── Audit fields ───────────────────────────────────────────────────────────

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
