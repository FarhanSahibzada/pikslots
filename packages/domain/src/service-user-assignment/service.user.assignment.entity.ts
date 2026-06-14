// ── Props ─────────────────────────────────────────────────────────────────────

export interface ServiceUserAssignmentProps {
  readonly id: string;
  readonly serviceId: string;
  readonly userId: string;
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

export interface ServiceUserAssignmentCreateInput {
  id: string;
  serviceId: string;
  userId: string;
  businessId: string;
  createdBy: string;
}

// ── Entity ────────────────────────────────────────────────────────────────────

export class ServiceUserAssignment {
  private readonly props: ServiceUserAssignmentProps;

  private constructor(props: ServiceUserAssignmentProps) {
    this.props = props;
  }

  /**
   * Creates a brand-new ServiceUserAssignment.
   * Use this in application use-cases, never for rehydrating persisted data.
   */
  static create(input: ServiceUserAssignmentCreateInput): ServiceUserAssignment {
    const now = new Date();
    return new ServiceUserAssignment({
      id: input.id,
      serviceId: input.serviceId,
      userId: input.userId,
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
   * Reconstitutes a ServiceUserAssignment from already-validated persistence data.
   * Never call with raw untrusted input.
   */
  static reconstitute(props: ServiceUserAssignmentProps): ServiceUserAssignment {
    return new ServiceUserAssignment(props);
  }

  /**
   * Soft-deletes this assignment. Returns a new immutable instance.
   */
  softDelete(deletedBy: string): ServiceUserAssignment {
    const now = new Date();
    return new ServiceUserAssignment({
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

  equals(other: ServiceUserAssignment): boolean {
    return this.props.id === other.props.id;
  }

  // ── Core fields ────────────────────────────────────────────────────────────

  get serviceId(): string {
    return this.props.serviceId;
  }

  get userId(): string {
    return this.props.userId;
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
