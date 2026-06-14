// ── Props ─────────────────────────────────────────────────────────────────────

import type { UserRole } from '../user';

export interface ClassGroupProps {
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

export interface ClassGroupCreateInput {
  id: string;
  name: string;
  businessId: string;
  createdBy: string;
}

// ── Entity ────────────────────────────────────────────────────────────────────

export class ClassGroup {
  private readonly props: ClassGroupProps;

  private constructor(props: ClassGroupProps) {
    this.props = props;
  }

  /**
   * Creates a brand-new ClassGroup with defaults applied.
   * Use this in application use-cases, never for rehydrating persisted data.
   */
  static create(input: ClassGroupCreateInput): ClassGroup {
    const now = new Date();
    return new ClassGroup({
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

  static canCreateNewClassGroup(callerRole: UserRole, isPartOfSameBusiness: boolean): boolean {
    if (callerRole === 'Platform Owner') return true;
    if ((callerRole === 'Business Owner' || callerRole === 'Admin') && isPartOfSameBusiness)
      return true;

    // Enhanced, Standard, No Access can only read
    return false;
  }

  /**
   * Reconstitutes a ClassGroup from already-validated data (e.g. a database row
   * decoded through ClassGroupSchema). Never call with raw untrusted input.
   */
  static reconstitute(props: ClassGroupProps): ClassGroup {
    return new ClassGroup(props);
  }

  rename(newName: string, updatedBy: string): ClassGroup {
    return new ClassGroup({
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

  equals(other: ClassGroup): boolean {
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
