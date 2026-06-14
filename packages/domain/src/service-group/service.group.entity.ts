// ── Props ─────────────────────────────────────────────────────────────────────

import type { UserRole } from '../user';

export interface ServiceGroupProps {
  readonly id: string;
  readonly name: string; // should be unique per business hence need to create custom uniqueness with (name + businessId)
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

export interface ServiceGroupCreateInput {
  id: string;
  name: string;
  businessId: string;
  createdBy: string;
}

// ── Entity ────────────────────────────────────────────────────────────────────

export class ServiceGroup {
  private readonly props: ServiceGroupProps;

  private constructor(props: ServiceGroupProps) {
    this.props = props;
  }

  /**
   * Creates a brand-new Service with defaults applied.
   * Use this in application use-cases, never for rehydrating persisted data.
   */
  static create(input: ServiceGroupCreateInput): ServiceGroup {
    const now = new Date();
    return new ServiceGroup({
      id: input.id,
      name: input.name,
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

  static canCreateNewServiceGroup(callerRole: UserRole, isPartOfSameBusiness: boolean): boolean {
    if (callerRole === 'Platform Owner') return true;
    if ((callerRole === 'Business Owner' || callerRole === 'Admin') && isPartOfSameBusiness)
      return true;

    // Enhanced , Standard , No acess can only read and shared services
    return false;
  }

  /**
   * Reconstitutes a Service from already-validated data (e.g. a database row
   * decoded through ServiceSchema). Never call with raw untrusted input.
   */
  static reconstitute(props: ServiceGroupProps): ServiceGroup {
    return new ServiceGroup(props);
  }

  rename(newName: string, updatedBy: string): ServiceGroup {
    return new ServiceGroup({
      ...this.props,
      name: newName,
      updatedAt: new Date(),
      updatedBy,
    });
  }

  // ── Identity ───────────────────────────────────────────────────────────────

  get id(): string {
    return this.props.id;
  }

  equals(other: ServiceGroup): boolean {
    return this.props.id === other.props.id;
  }

  // ── Core fields ────────────────────────────────────────────────────────────

  get name(): string {
    return this.props.name;
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
