import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { RegisterBusinessDto } from '../dto/register.business.dto';
import { UpdateBusinessBrandDetailsDto } from '../dto/update.business.brand.details.dto';
import { UpdateBusinessAppearanceDto } from '../dto/update.business.appearance.dto';
import { UpdateBusinessLocationDto } from '../dto/update.business.location.dto';
import { UpdateBusinessGeneralDto } from '../dto/update.business.general.dto';
import { UpdateBusinessBookingPoliciesDto } from '../dto/update.business.booking.policies.dto';
import { UpdateBusinessBookingSetupDto } from '../dto/update.business.booking.setup.dto';
import { UpdateBusinessBookingCustomizationDto } from '../dto/update.business.booking.customization.dto';
import { UpdateBusinessVisibilityDto } from '../dto/update.business.visibility.dto';
import { UpdateBusinessTeamNotificationsDto } from '../dto/update.business.team.notifications.dto';
import { UpdateBusinessCustomerNotificationsDto } from '../dto/update.business.customer.notifications.dto';
import { UpdateBusinessNotificationCustomizationDto } from '../dto/update.business.notification.customization.dto';
import { UpdateBusinessHoursDto } from '../dto/update.business.hours.dto';
import { UpdateBusinessLinksDto } from '../dto/update.business.links.dto';
import { UpdateBusinessContactDetailsDto } from '../dto/update.business.contact.details.dto';

export const GetBusinessByIdDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get a business by ID' }),
    ApiParam({
      name: 'id',
      description: 'Business UUID',
      example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7b',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Business returned successfully',
      schema: {
        example: {
          data: {
            id: 'uuid',
            name: "Joe's Barbershop",
            slug: 'joes-barbershop',
            status: 'active',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Business not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Business suspended or inactive',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const GetAllBusinessesDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all registered businesses (superAdmin only)',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'List of all businesses returned successfully',
      schema: {
        example: {
          data: {
            businesses: [
              {
                id: 'uuid',
                name: "Joe's Barbershop",
                slug: 'joes-barbershop',
                email: 'contact@joesbarbershop.com',
                industry: 'salon_and_beauty',
                status: 'active',
                subscriptionPlan: 'free',
                createdAt: '2026-01-01T00:00:00.000Z',
              },
            ],
            total: 1,
          },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Access denied — superAdmin role required',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Database or infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const UpdateBusinessBrandDetailsDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update brand details for a business' }),
    ApiParam({ name: 'id', description: 'Business ID', example: 'biz_01j...' }),
    ApiBody({ type: UpdateBusinessBrandDetailsDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Brand details updated successfully',
      schema: {
        example: {
          data: {
            id: 'biz_01j...',
            name: "Joe's Barbershop",
            slug: 'joes-barbershop',
            industry: 'salon_and_beauty',
            about: 'We are a premium barbershop...',
            brandDetail: {
              bannerImageUrl: 'https://cdn.example.com/banner.jpg',
              brandLogoUrl: 'https://cdn.example.com/logo.png',
            },
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Business not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Slug is already taken by another business',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Database or infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const UpdateBusinessLocationDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update location details for a business' }),
    ApiParam({ name: 'id', description: 'Business ID', example: 'biz_01j...' }),
    ApiBody({ type: UpdateBusinessLocationDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Location updated successfully',
      schema: {
        example: {
          data: {
            id: 'biz_01j...',
            locationDetails: {
              address: '123 Main Street',
              city: 'San Francisco',
              state: 'California',
              zip: '94102',
              country: 'United States',
              currency: 'USD',
            },
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Business not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Database or infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const UpdateBusinessAppearanceDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update appearance settings for a business' }),
    ApiParam({ name: 'id', description: 'Business ID', example: 'biz_01j...' }),
    ApiBody({ type: UpdateBusinessAppearanceDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Appearance updated successfully',
      schema: {
        example: {
          data: {
            id: 'biz_01j...',
            brandAppearanceDetails: {
              brandColor: '#2980b9',
              brandButtonShape: 'pill',
              theme: 'system',
              gallaryPhotosUrls: [],
            },
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Business not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Database or infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const UpdateBusinessGeneralDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update general settings for a business' }),
    ApiParam({ name: 'id', description: 'Business ID', example: 'biz_01j...' }),
    ApiBody({ type: UpdateBusinessGeneralDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'General settings updated successfully',
      schema: {
        example: {
          data: {
            id: 'biz_01j...',
            locationDetails: { language: 'en' },
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Business not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Database or infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const UpdateBusinessTeamNotificationsDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update team notification settings for a business',
    }),
    ApiParam({ name: 'id', description: 'Business ID', example: 'biz_01j...' }),
    ApiBody({ type: UpdateBusinessTeamNotificationsDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Team notifications updated successfully',
      schema: {
        example: {
          data: {
            id: 'biz_01j...',
            teamNotifications: {},
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Business not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Database or infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const UpdateBusinessVisibilityDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update booking page visibility for a business' }),
    ApiParam({ name: 'id', description: 'Business ID', example: 'biz_01j...' }),
    ApiBody({ type: UpdateBusinessVisibilityDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Visibility updated successfully',
      schema: {
        example: {
          data: {
            id: 'biz_01j...',
            appearInSearchResults: true,
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Business not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Database or infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const UpdateBusinessBookingCustomizationDocs = () =>
  applyDecorators(
    ApiOperation({
      summary:
        'Update booking customization and label overrides for a business',
    }),
    ApiParam({ name: 'id', description: 'Business ID', example: 'biz_01j...' }),
    ApiBody({ type: UpdateBusinessBookingCustomizationDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Booking customization updated successfully',
      schema: {
        example: {
          data: {
            id: 'biz_01j...',
            bookingCustomization: {},
            bookingLabelOverrides: {},
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Business not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Database or infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const UpdateBusinessBookingSetupDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update booking setup and contact fields for a business',
    }),
    ApiParam({ name: 'id', description: 'Business ID', example: 'biz_01j...' }),
    ApiBody({ type: UpdateBusinessBookingSetupDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Booking setup updated successfully',
      schema: {
        example: {
          data: {
            id: 'biz_01j...',
            bookingSetup: {},
            bookingContactFields: {},
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Business not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Database or infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const UpdateBusinessBookingPoliciesDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update booking policies for a business' }),
    ApiParam({ name: 'id', description: 'Business ID', example: 'biz_01j...' }),
    ApiBody({ type: UpdateBusinessBookingPoliciesDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Booking policies updated successfully',
      schema: {
        example: {
          data: {
            id: 'biz_01j...',
            bookingPolicies: {
              leadTime: { unit: 'hours', value: 1 },
              scheduleWindow: { unit: 'days', value: 30 },
              cancellationPolicy: null,
              bookingPolicyText: '',
              showPolicyOnBookingPage: false,
            },
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Business not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Database or infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const RegisterBusinessDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Register a new business (Platform Owner Only )' }),
    ApiBody({ type: RegisterBusinessDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Business registered successfully',
      schema: {
        example: {
          data: { message: 'success' },
          statusCode: 201,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'A business with this slug already exists',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const UpdateBusinessCustomerNotificationsDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update customer notification settings for a business',
    }),
    ApiParam({ name: 'id', description: 'Business ID', example: 'biz_01j...' }),
    ApiBody({ type: UpdateBusinessCustomerNotificationsDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Customer notifications updated successfully',
      schema: {
        example: {
          data: {
            id: 'biz_01j...',
            customerNotifications: {},
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Business not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Database or infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const UpdateBusinessNotificationCustomizationDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update notification customization for a business',
    }),
    ApiParam({ name: 'id', description: 'Business ID', example: 'biz_01j...' }),
    ApiBody({ type: UpdateBusinessNotificationCustomizationDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Notification customization updated successfully',
      schema: {
        example: {
          data: {
            id: 'biz_01j...',
            notificationCustomization: {},
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Business not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Database or infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const UpdateBusinessHoursDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update business hours for a business' }),
    ApiParam({ name: 'id', description: 'Business ID', example: 'biz_01j...' }),
    ApiBody({ type: UpdateBusinessHoursDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Business hours updated successfully',
      schema: {
        example: {
          data: {
            id: 'biz_01j...',
            businessHours: {},
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Business not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Database or infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const UpdateBusinessLinksDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update social/website links for a business' }),
    ApiParam({ name: 'id', description: 'Business ID', example: 'biz_01j...' }),
    ApiBody({ type: UpdateBusinessLinksDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Business links updated successfully',
      schema: {
        example: {
          data: {
            id: 'biz_01j...',
            businessLinks: {
              Website: '',
              Instagram: '',
              Facebook: '',
              Tiktok: '',
              X: '',
              Youtube: '',
              LinkedIn: '',
            },
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Business not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Database or infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const UpdateBusinessContactDetailsDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update contact details for a business' }),
    ApiParam({ name: 'id', description: 'Business ID', example: 'biz_01j...' }),
    ApiBody({ type: UpdateBusinessContactDetailsDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Contact details updated successfully',
      schema: {
        example: {
          data: {
            id: 'biz_01j...',
            contactDetails: {
              primaryEmail: '',
              primaryPhone: { countryCode: '+1', number: '' },
              additionalEmails: [],
              additionalPhones: [],
            },
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Business not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Database or infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );
