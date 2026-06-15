// ── Props ─────────────────────────────────────────────────────────────────────

import type { FullName } from '../shared';
import type { UserRole } from '../user';
import type { CustomerLinks } from './value-objects/customer.links.vo';

export interface CustomerProps {
  readonly id: string;
  readonly name: FullName;
  readonly profileImageUrl: string | null;
  readonly email: string | null;
  readonly additionalEmail: string | null;
  readonly primaryPhone: string | null;
  readonly additionalPhone: string | null;
  readonly company: string | null;
  readonly country: string | null;
  readonly address: string | null;
  readonly city: string | null;
  readonly state: string | null;
  readonly zipCode: string | null;
  readonly notes: string | null;
  readonly customerSocialLinks: CustomerLinks;
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

export interface CreateCustomerInput {
  id: string;
  name: FullName;
  email: string | null;
  additionalEmail: string | null;
  primaryPhone: string | null;
  additionalPhone: string | null;
  company: string | null;
  country: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  notes: string | null;
  customerSocialLinks: CustomerLinks;
  profileImageUrl: string | null;
  businessId: string;
  createdBy: string;
}

// ── Entity ────────────────────────────────────────────────────────────────────

export class Customer {
  private readonly props: CustomerProps;

  private constructor(props: CustomerProps) {
    this.props = props;
  }

  /**
   * Creates a brand-new Customer with audit defaults applied.
   * Use this in application use-cases, never for rehydrating persisted data.
   */
  static create(input: CreateCustomerInput): Customer {
    const now = new Date();
    return new Customer({
      id: input.id,
      name: input.name,
      email: input.email,
      additionalEmail: input.additionalEmail,
      primaryPhone: input.primaryPhone,
      additionalPhone: input.additionalPhone,
      company: input.company,
      country: input.country,
      address: input.address,
      city: input.city,
      state: input.state,
      zipCode: input.zipCode,
      notes: input.notes,
      customerSocialLinks: input.customerSocialLinks,
      profileImageUrl: input.profileImageUrl,
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
   * Reconstitutes a Customer from already-validated data (e.g. a database row).
   * Never call with raw untrusted input.
   */
  static reconstitute(props: CustomerProps): Customer {
    return new Customer(props);
  }

  // ── Business rules ──────────────────────────────────────────────────────────

  static canRegisterCustomer(callerRole: UserRole, isPartOfSameBusiness: boolean): boolean {
    if (callerRole === 'Platform Owner') return true;
    if (
      (callerRole === 'Business Owner' ||
        callerRole === 'Admin' ||
        callerRole === 'Enhanced' ||
        callerRole === 'Standard') &&
      isPartOfSameBusiness
    )
      return true;
    return false;
  }

  static canEditCustomer(callerRole: UserRole, isPartOfSameBusiness: boolean): boolean {
    if (callerRole === 'Platform Owner') return true;
    if (
      (callerRole === 'Business Owner' ||
        callerRole === 'Admin' ||
        callerRole === 'Enhanced' ||
        callerRole === 'Standard') &&
      isPartOfSameBusiness
    )
      return true;
    return false;
  }

  static canDeleteCustomer(callerRole: UserRole, isPartOfSameBusiness: boolean): boolean {
    if (callerRole === 'Platform Owner') return true;
    if ((callerRole === 'Business Owner' || callerRole === 'Admin') && isPartOfSameBusiness)
      return true;
    return false;
  }

  // ── Mutation methods ────────────────────────────────────────────────────────

  update(input: {
    name: FullName;
    email: string | null;
    additionalEmail: string | null;
    primaryPhone: string | null;
    additionalPhone: string | null;
    company: string | null;
    country: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    notes: string | null;
    customerSocialLinks: CustomerLinks;
    profileImageUrl: string | null;
    updatedBy: string;
  }): Customer {
    return new Customer({
      ...this.props,
      name: input.name,
      email: input.email,
      additionalEmail: input.additionalEmail,
      primaryPhone: input.primaryPhone,
      additionalPhone: input.additionalPhone,
      company: input.company,
      country: input.country,
      address: input.address,
      city: input.city,
      state: input.state,
      zipCode: input.zipCode,
      notes: input.notes,
      customerSocialLinks: input.customerSocialLinks,
      profileImageUrl: input.profileImageUrl,
      updatedAt: new Date(),
      updatedBy: input.updatedBy,
    });
  }

  softDelete(deletedBy: string): Customer {
    return new Customer({
      ...this.props,
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy,
      updatedAt: new Date(),
      updatedBy: deletedBy,
    });
  }

  // ── Identity ────────────────────────────────────────────────────────────────

  get id(): string {
    return this.props.id;
  }

  equals(other: Customer): boolean {
    return this.props.id === other.props.id;
  }

  // ── Core fields ─────────────────────────────────────────────────────────────

  get name(): FullName {
    return this.props.name;
  }
  get email(): string | null {
    return this.props.email;
  }
  get additionalEmail(): string | null {
    return this.props.additionalEmail;
  }
  get primaryPhone(): string | null {
    return this.props.primaryPhone;
  }
  get additionalPhone(): string | null {
    return this.props.additionalPhone;
  }
  get company(): string | null {
    return this.props.company;
  }
  get country(): string | null {
    return this.props.country;
  }
  get address(): string | null {
    return this.props.address;
  }
  get city(): string | null {
    return this.props.city;
  }
  get state(): string | null {
    return this.props.state;
  }
  get zipCode(): string | null {
    return this.props.zipCode;
  }
  get customerSocialLinks(): CustomerLinks {
    return this.props.customerSocialLinks;
  }
  get profileImageUrl(): string | null {
    return this.props.profileImageUrl;
  }
  get notes(): string | null {
    return this.props.notes;
  }
  get businessId(): string {
    return this.props.businessId;
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
