// ── Props ─────────────────────────────────────────────────────────────────────

export interface ClassGroupAssignmentProps {
  readonly id: string;
  readonly classId: string;
  readonly classGroupId: string;
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

export interface ClassGroupAssignmentCreateInput {
  id: string;
  classId: string;
  classGroupId: string;
  businessId: string;
  createdBy: string;
}

// ── Entity ────────────────────────────────────────────────────────────────────

export class ClassGroupAssignment {
  private readonly props: ClassGroupAssignmentProps;

  private constructor(props: ClassGroupAssignmentProps) {
    this.props = props;
  }

  /**
   * Creates a brand-new ClassGroupAssignment.
   * Use this in application use-cases, never for rehydrating persisted data.
   */
  static create(input: ClassGroupAssignmentCreateInput): ClassGroupAssignment {
    const now = new Date();
    return new ClassGroupAssignment({
      id: input.id,
      classId: input.classId,
      classGroupId: input.classGroupId,
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
   * Reconstitutes a ClassGroupAssignment from already-validated persistence data.
   * Never call with raw untrusted input.
   */
  static reconstitute(props: ClassGroupAssignmentProps): ClassGroupAssignment {
    return new ClassGroupAssignment(props);
  }

  /**
   * Soft-deletes this assignment. Returns a new immutable instance.
   */
  softDelete(deletedBy: string): ClassGroupAssignment {
    const now = new Date();
    return new ClassGroupAssignment({
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

  equals(other: ClassGroupAssignment): boolean {
    return this.props.id === other.props.id;
  }

  // ── Core fields ────────────────────────────────────────────────────────────

  get classId(): string {
    return this.props.classId;
  }

  get classGroupId(): string {
    return this.props.classGroupId;
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
