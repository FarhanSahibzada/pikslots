import { CustomerProps } from '@pikslots/domain';
import {
  FullCustomerResponse,
  PartialCustomerResponse,
} from '@pikslots/shared';
import { PikslotS3Service } from 'src/shared/s3/s3.service';

export class CustomerResponseMapper {
  static async toCustomerResponse(
    customer: CustomerProps,
    s3Service: PikslotS3Service,
  ): Promise<FullCustomerResponse> {
    const profile = {
      profileImageUrl:
        customer.profileImageUrl !== ''
          ? await s3Service.getPresignedDownloadUrl(
              customer.profileImageUrl as string,
            )
          : customer.profileImageUrl,
    };

    return {
      id: customer.id,
      firstName: customer.name.firstName,
      lastName: customer.name.lastName,
      email: customer.email,
      additionalEmail: customer.additionalEmail,
      primaryPhone: customer.primaryPhone,
      additionalPhone: customer.additionalPhone,
      company: customer.company,
      country: customer.country,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      zipCode: customer.zipCode,
      notes: customer.notes,
      customerSocialLinks: customer.customerSocialLinks,
      additionalFields: customer.additionalFields,
      profileImageUrl: profile.profileImageUrl,
      businessId: customer.businessId,
    };
  }

  static async toPartialCustomerResponse(
    customer: PartialCustomerResponse,
    s3Service: PikslotS3Service,
  ): Promise<PartialCustomerResponse> {
    const profile = {
      profileImageUrl:
        customer.profileImageUrl !== ''
          ? await s3Service.getPresignedDownloadUrl(
              customer.profileImageUrl as string,
            )
          : customer.profileImageUrl,
    };

    return {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      profileImageUrl: profile.profileImageUrl,
    };
  }
}
