import type { AuditLogJobDataShape } from '../shared';
import type { UserRole } from '../user';

// ── Props ─────────────────────────────────────────────────────────────────────

export interface AuditLogProps {
  readonly id: string;
  readonly businessId: string | null; // platform owner -> businessId is null
  readonly userId: string;
  readonly userType: AuditLogJobDataShape['userType'];
  readonly action: string;
  readonly description: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly occurredAt: Date;
  readonly ipAddress: string | null;
  readonly metadata: Record<string, unknown> | null;
  // audit logs are an append-only ledger: no updatedAt/deletedAt/isDeleted
  readonly createdAt: Date;
}

// ── Create input ──────────────────────────────────────────────────────────────

export interface CreateAuditLogInput extends AuditLogJobDataShape {
  id: string;
}

// ── Entity ────────────────────────────────────────────────────────────────────

export class AuditLog {
  private readonly props: AuditLogProps;

  private constructor(props: AuditLogProps) {
    this.props = props;
  }

  /**
   * Creates a brand-new AuditLog entry from a queued job payload.
   * Use this in application use-cases, never for rehydrating persisted data.
   */
  static create(input: CreateAuditLogInput): AuditLog {
    return new AuditLog({
      id: input.id,
      businessId: input.businessId,
      userId: input.userId,
      userType: input.userType,
      action: input.action,
      description: input.description,
      entityType: input.entityType,
      entityId: input.entityId,
      occurredAt: new Date(input.occurredAt),
      ipAddress: input.ipAddress ?? null,
      metadata: input.metadata ?? null,
      createdAt: new Date(),
    });
  }

  /**
   * Reconstitutes an AuditLog from already-validated data (e.g. a database
   * row). Never call with raw untrusted input.
   */
  static reconstitute(props: AuditLogProps): AuditLog {
    return new AuditLog(props);
  }

  // ── Business rules ─────────────────────────────────────────────────────────

  static canViewAuditLogs(callerRole: UserRole, isPartOfSameBusiness: boolean): boolean {
    if (callerRole === 'Platform Owner') return true;
    if ((callerRole === 'Business Owner' || callerRole === 'Admin') && isPartOfSameBusiness)
      return true;
    return false;
  }

  // ── Identity ───────────────────────────────────────────────────────────────

  get id(): string {
    return this.props.id;
  }

  equals(other: AuditLog): boolean {
    return this.props.id === other.props.id;
  }

  // ── Core fields ────────────────────────────────────────────────────────────

  get businessId(): string | null {
    return this.props.businessId;
  }
  get userId(): string {
    return this.props.userId;
  }
  get userType(): AuditLogJobDataShape['userType'] {
    return this.props.userType;
  }
  get action(): string {
    return this.props.action;
  }
  get description(): string {
    return this.props.description;
  }
  get entityType(): string {
    return this.props.entityType;
  }
  get entityId(): string {
    return this.props.entityId;
  }
  get occurredAt(): Date {
    return this.props.occurredAt;
  }
  get ipAddress(): string | null {
    return this.props.ipAddress;
  }
  get metadata(): Record<string, unknown> | null {
    return this.props.metadata;
  }

  // ── Audit fields ───────────────────────────────────────────────────────────

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
