// ── Enums ─────────────────────────────────────────────────────────────────────

/**
 * Defines the access level of a user within the platform.
 *
 * ┌─────────────────┬──────────────────────────────────────────────────────────────────┐
 * │ Role            │ Permissions                                                      │
 * ├─────────────────┼──────────────────────────────────────────────────────────────────┤
 * │ Platform Owner  │ Full access to all businesses on the platform                    │
 * │ Business Owner  │ Full access to their own business only                           │
 * │ No Access       │ Cannot log in — calendar is managed by Enhanced/Admin users      │
 * │ Standard        │ Can manage their own calendar only                               │
 * │ Enhanced        │ Can manage all team member calendars + customer profiles         │
 * │ Admin           │ Enhanced permissions + ability to manage all account settings    │
 * └─────────────────┴──────────────────────────────────────────────────────────────────┘
 */
export type UserRole =
  | 'Platform Owner'
  | 'Business Owner'
  | 'No Access'
  | 'Standard'
  | 'Enhanced'
  | 'Admin';

export type UserStatus = 'invited' | 'active' | 'inactive' | 'suspended';
export type SupportedSoundTypes = 'chime' | 'whistle';

// ── Value objects ─────────────────────────────────────────────────────────────

export interface FullName {
  readonly firstName: string;
  readonly lastName: string;
}

export interface NotificationPreferences {
  readonly notificationMode: 'all' | 'focus' | 'none';
  readonly soundEnabled: boolean;
  readonly soundType: SupportedSoundTypes;
}

export interface AppointmentReminders {
  reminderEnabled: boolean;
  reminderMinutesBefore: number;
  reminderSoundType: SupportedSoundTypes;
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface UserProps {
  readonly id: string;
  readonly username: string;
  readonly password: string;
  readonly name: FullName;
  readonly email: string;
  readonly phone: string | null;
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly avatarUrl: string | null;
  readonly emailVerified: boolean;
  readonly bookingUrl: string;
  readonly notificationPreferences: NotificationPreferences;
  readonly appointmentReminders: AppointmentReminders;
  readonly lastLoginAt: Date | null;
  readonly suspendedReason: string | null;
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

export interface CreateUserInput {
  id: string;
  username: string;
  password: string;
  name: FullName;
  email: string;
  phone?: string;
  role: UserRole;
  bookingUrl: string;
  createdBy: string;
}

// ── Entity ────────────────────────────────────────────────────────────────────

export class User {
  private readonly props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  /**
   * Creates a brand-new User with business defaults applied.
   * Use this in application use-cases, never for rehydrating persisted data.
   */
  static create(input: CreateUserInput): User {
    const now = new Date();
    return new User({
      id: input.id,
      username: input.username,
      password: input.password,
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      role: input.role,
      status: 'invited',
      bookingUrl: input.bookingUrl,
      avatarUrl: null,
      emailVerified: false,
      notificationPreferences: { notificationMode: 'all', soundEnabled: true, soundType: 'chime' },
      appointmentReminders: {
        reminderEnabled: true,
        reminderMinutesBefore: 10,
        reminderSoundType: 'chime',
      },
      lastLoginAt: null,
      suspendedReason: null,
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
   * Reconstitutes a User from already-validated data (e.g. a database row
   * decoded through UserSchema). Never call with raw untrusted input.
   */
  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  // ── Business rules ─────────────────────────────────────────────────────────

  private static readonly INVITE_PERMISSIONS: Record<UserRole, UserRole[]> = {
    'Platform Owner': ['Business Owner', 'Admin', 'Enhanced', 'Standard', 'No Access'],
    'Business Owner': ['Admin', 'Enhanced', 'Standard', 'No Access'],
    Admin: ['Enhanced', 'Standard', 'No Access'],
    Enhanced: [],
    Standard: [],
    'No Access': [],
  };

  static canInviteRole(inviterRole: UserRole, targetRole: UserRole): boolean {
    return User.INVITE_PERMISSIONS[inviterRole].includes(targetRole);
  }

  private static readonly QUERY_PERMISSIONS: Record<UserRole, UserRole[]> = {
    'Platform Owner': [
      'Platform Owner',
      'Business Owner',
      'Admin',
      'Enhanced',
      'Standard',
      'No Access',
    ],
    'Business Owner': ['Admin', 'Enhanced', 'Standard', 'No Access'],
    Admin: ['Enhanced', 'Standard', 'No Access'],
    Enhanced: [],
    Standard: [],
    'No Access': [],
  };

  static canQueryRole(callerRole: UserRole, targetRole: UserRole): boolean {
    return User.QUERY_PERMISSIONS[callerRole].includes(targetRole);
  }

  // ── Identity ───────────────────────────────────────────────────────────────

  get id(): string {
    return this.props.id;
  }

  equals(other: User): boolean {
    return this.props.id === other.props.id;
  }

  // ── Core fields ────────────────────────────────────────────────────────────

  get username(): string {
    return this.props.username;
  }
  get password(): string {
    return this.props.password;
  }
  get name(): FullName {
    return this.props.name;
  }
  get email(): string {
    return this.props.email;
  }
  get phone(): string | null {
    return this.props.phone;
  }
  get role(): UserRole {
    return this.props.role;
  }
  get status(): UserStatus {
    return this.props.status;
  }
  get avatarUrl(): string | null {
    return this.props.avatarUrl;
  }
  get emailVerified(): boolean {
    return this.props.emailVerified;
  }
  get bookingUrl(): string {
    return this.props.bookingUrl;
  }
  get notificationPreferences(): NotificationPreferences {
    return this.props.notificationPreferences;
  }
  get appointmentReminders(): AppointmentReminders {
    return this.props.appointmentReminders;
  }
  get lastLoginAt(): Date | null {
    return this.props.lastLoginAt;
  }
  get suspendedReason(): string | null {
    return this.props.suspendedReason;
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
