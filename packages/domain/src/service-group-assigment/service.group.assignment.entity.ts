// ── Props ─────────────────────────────────────────────────────────────────────

export interface ServiceGroupAssignmentProps {
  readonly id: string;
  readonly serviceId: string;
  readonly serviceGroupId: string;
  readonly businessId: string; // denormalized for efficient queries
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

export interface ServiceGroupAssignmentCreateInput {
  id: string;
  serviceId: string;
  serviceGroupId: string;
  businessId: string;
  createdBy: string;
}

// ── Entity ────────────────────────────────────────────────────────────────────

export class ServiceGroupAssignment {
  private readonly props: ServiceGroupAssignmentProps;

  private constructor(props: ServiceGroupAssignmentProps) {
    this.props = props;
  }

  /**
   * Creates a brand-new ServiceGroupAssignment.
   * Use this in application use-cases, never for rehydrating persisted data.
   */
  static create(input: ServiceGroupAssignmentProps): ServiceGroupAssignment {
    const now = new Date();
    return new ServiceGroupAssignment({
      id: input.id,
      serviceId: input.serviceId,
      serviceGroupId: input.serviceGroupId,
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

  /**
   * Reconstitutes a ServiceGroupAssignment from already-validated persistence data.
   * Never call with raw untrusted input.
   */
  static reconstitute(props: ServiceGroupAssignment): ServiceGroupAssignment {
    return new ServiceGroupAssignment(props);
  }

  /**
   * Soft-deletes this assignment. Returns a new immutable instance.
   */
  softDelete(deletedBy: string): ServiceGroupAssignment {
    const now = new Date();
    return new ServiceGroupAssignment({
      ...this.props,
      isDeleted: true,
      deletedAt: now,
      deletedBy,
      updatedAt: now,
      updatedBy: deletedBy,
    });
  }

  // ── Identity ───────────────────────────────────────────────────────────────

  get id(): string {
    return this.props.id;
  }

  equals(other: ServiceGroupAssignment): boolean {
    return this.props.id === other.props.id;
  }

  // ── Core fields ────────────────────────────────────────────────────────────

  get serviceId(): string {
    return this.props.serviceId;
  }

  get serviceGroupId(): string {
    return this.props.serviceGroupId;
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
