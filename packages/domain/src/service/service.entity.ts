// ── Props ─────────────────────────────────────────────────────────────────────

import type { UserRole } from '../user';

export interface ServiceProps {
  readonly id: string;
  readonly title: string; // should be unique per business
  readonly description: string;
  readonly images: string[]; // only 5 images allowed
  readonly durationInMins: number;
  readonly bufferTimeInMins: number; // the time between two consecutive services
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

export interface ServiceCreateInput {
  id: string;
  title: string;
  description: string;
  imagesUrls: string[]; // only 5 images allowed
  durationInMins: number;
  bufferTimeInMins: number; // the time between two consecutive services
  isHiddenFromBookingPage: boolean;
  cost: number;
  businessId: string;
  createdBy: string;
}

// ── Entity ────────────────────────────────────────────────────────────────────

export class Service {
  private readonly props: ServiceProps;

  private constructor(props: ServiceProps) {
    this.props = props;
  }

  /**
   * Creates a brand-new Service with defaults applied.
   * Use this in application use-cases, never for rehydrating persisted data.
   */
  static create(input: ServiceCreateInput): Service {
    const now = new Date();
    return new Service({
      id: input.id,
      title: input.title,
      description: input.description,
      images: input.imagesUrls,
      durationInMins: input.durationInMins,
      bufferTimeInMins: input.bufferTimeInMins,
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
    bufferTimeInMins: number;
    cost: number;
    isHiddenFromBookingPage: boolean;
    updatedBy: string;
  }): Service {
    return new Service({
      ...this.props,
      title: input.title,
      description: input.description,
      images: input.imagesUrls,
      durationInMins: input.durationInMins,
      bufferTimeInMins: input.bufferTimeInMins,
      cost: input.cost,
      isHiddenFromBookingPage: input.isHiddenFromBookingPage,
      updatedAt: new Date(),
      updatedBy: input.updatedBy,
    });
  }

  static canRegisterService(callerRole: UserRole, isPartOfSameBusiness: boolean): boolean {
    if (callerRole === 'Platform Owner') return true;
    if ((callerRole === 'Business Owner' || callerRole === 'Admin') && isPartOfSameBusiness)
      return true;

    // Enhanced , Standard , No acess
    return false;
  }

  static canEditService(callerRole: UserRole, isPartOfSameBusiness: boolean): boolean {
    if (callerRole === 'Platform Owner') return true;
    if ((callerRole === 'Business Owner' || callerRole === 'Admin') && isPartOfSameBusiness)
      return true;

    // Enhanced , Standard , No acess
    return false;
  }

  static canDeleteService(callerRole: UserRole, isPartOfSameBusiness: boolean): boolean {
    if (callerRole === 'Platform Owner') return true;
    if ((callerRole === 'Business Owner' || callerRole === 'Admin') && isPartOfSameBusiness)
      return true;

    // Enhanced , Standard , No acess
    return false;
  }

  /**
   * Reconstitutes a Service from already-validated data (e.g. a database row
   * decoded through ServiceSchema). Never call with raw untrusted input.
   */
  static reconstitute(props: ServiceProps): Service {
    return new Service(props);
  }

  // ── Identity ───────────────────────────────────────────────────────────────

  get id(): string {
    return this.props.id;
  }

  equals(other: Service): boolean {
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
  get bufferTimeInMins(): number {
    return this.props.bufferTimeInMins;
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
