import { Customer } from '@pikslots/domain';
import {
  domainAuditToPersistence,
  persistenceAuditToDomain,
} from 'src/shared/database/mapper/audit.fields.mapper';
import {
  CustomerTableInsert,
  CustomerTableSelect,
} from 'src/shared/database/schema/customer.table';

export class CustomerPersistenceMapper {
  public persistenceToDomain(row: CustomerTableSelect): Customer {
    return Customer.reconstitute({
      id: row.id,
      name: { firstName: row.first_name, lastName: row.last_name },
      profileImageUrl: row.profile_image_url,
      email: row.email,
      additionalEmail: row.additional_email,
      primaryPhone: row.primary_phone,
      additionalPhone: row.additional_phone,
      company: row.company,
      country: row.country,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code,
      notes: row.notes,
      customerSocialLinks: row.customer_social_links,
      businessId: row.business_id,
      ...persistenceAuditToDomain(row),
    });
  }

  public domainToPersistence(customer: Customer): CustomerTableInsert {
    return {
      id: customer.id,
      first_name: customer.name.firstName,
      last_name: customer.name.lastName,
      profile_image_url: customer.profileImageUrl,
      email: customer.email,
      additional_email: customer.additionalEmail,
      primary_phone: customer.primaryPhone,
      additional_phone: customer.additionalPhone,
      company: customer.company,
      country: customer.country,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      zip_code: customer.zipCode,
      notes: customer.notes,
      customer_social_links: customer.customerSocialLinks,
      business_id: customer.businessId,
      ...domainAuditToPersistence(customer),
    };
  }
}
