import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { RegisterPublicBookingDto } from '../dto/register.public.booking.dto';

export const GetPublicBookingPageDetailsDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get public booking page details by business slug',
    }),
    ApiParam({
      name: 'businessSlug',
      description: 'Business slug',
      example: 'my-business',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Public booking page details retrieved successfully',
      schema: {
        example: {
          data: {
            business: {
              id: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7b',
              name: 'My Business',
              slug: 'my-business',
              about: 'We are a great business',
              brandDetail: {
                bannerImageUrl: 'https://example.com/banner.jpg',
                logoUrl: 'https://example.com/logo.jpg',
                name: 'My Business',
                slug: 'my-business',
                industry: 'Salon',
                about: 'We are a great business',
              },
              brandApperanceDetails: {
                brandColor: '#000000',
                brandButtonShape: 'rounded',
                theme: 'light',
                gallaryPhotosUrls: [],
              },
              bookingSetup: {
                bookAppointmentSectionVisible: true,
                bookClassSectionVisible: false,
                aboutUsSectionVisible: true,
                ourTeamSectionVisible: true,
                servicesSectionVisible: true,
                classesSectionVisible: false,
                showFirstAvailable: true,
                skipTeamSelection: false,
                allowToBookMultipleServices: false,
                bypassTeamMemberSelection: false,
                customerLoginEnabled: false,
                customerLoginRequired: false,
                hidePikslotsBranding: false,
                accordionView: false,
                allowRescheduling: true,
                allowCancellations: true,
                showBookNewButton: true,
                nameEnabled: true,
                nameRequired: true,
                emailEnabled: true,
                emailRequired: true,
                phoneEnabled: true,
                phoneRequired: false,
                addressEnabled: false,
                addressRequired: false,
              },
              locationDetails: {
                address: '123 Main St',
                city: 'New York',
                state: 'NY',
                zip: '10001',
                country: 'US',
                currency: 'USD',
                timeZone: 'America/New_York',
              },
              bookingPolicies: {
                leadTime: 60,
                scheduleWindow: 30,
                cancellationPolicy: 'flexible',
                bookingPolicyText: '',
                showPolicyOnBookingPage: false,
              },
              bookingContactFields: {},
              bookingCustomization: {},
              bookingLabelOverrides: {},
              businessHours: {},
              businessLinks: {},
            },
            services: {
              groups: [
                {
                  id: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7b',
                  name: 'Hair Services',
                  services: [
                    {
                      id: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7c',
                      title: 'Haircut',
                      description: 'A classic haircut',
                      serviceAvatar: 'https://example.com/haircut.jpg',
                      durationInMins: 30,
                      bufferTimeInMins: 5,
                      cost: 50,
                      isHiddenFromBookingPage: false,
                      colorCode: '#FF5733',
                    },
                  ],
                },
              ],
              services: [
                {
                  id: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7d',
                  title: 'Beard Trim',
                  description: 'A classic beard trim',
                  serviceAvatar: 'https://example.com/beard.jpg',
                  durationInMins: 15,
                  bufferTimeInMins: 5,
                  cost: 20,
                  isHiddenFromBookingPage: false,
                  colorCode: '#33FF57',
                },
              ],
            },
            teamMembers: [
              {
                id: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7e',
                name: { firstName: 'John', lastName: 'Doe' },
                avatarUrl: null,
                role: 'Standard',
              },
            ],
          },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Public booking page not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const RegisterPublicBookingDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Register a public (guest) booking from the booking page',
    }),
    ApiBody({ type: RegisterPublicBookingDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Public booking registered successfully',
      schema: {
        example: {
          data: { message: 'success', bookingId: 'BK3KX9M2P' },
          statusCode: 201,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Service or customer not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description:
        'A booking already exists for this time slot, or customer already exists',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Assigned team member is not part of this business',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );
