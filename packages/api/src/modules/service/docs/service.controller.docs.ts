import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { RegisterServiceDto } from '../dto/register.service.dto';

export const RegisterServiceDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Register a new service for the authenticated business' }),
    ApiBody({ type: RegisterServiceDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Service registered successfully',
      schema: {
        example: {
          data: { id: 'svc_01j...', title: 'Haircut' },
          statusCode: 201,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'A service with this title already exists for this business',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const FindAllServicesByBusinessDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all services for a business' }),
    ApiParam({ name: 'businessId', description: 'Business ID', example: 'biz_01j...' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Services retrieved successfully',
      schema: {
        example: {
          data: [
            {
              id: 'svc_01j...',
              title: 'Haircut',
              description: '30-min haircut',
              images: [],
              durationInMins: 30,
              bufferTimeInMins: 5,
              cost: 25,
              isHiddenFromBookingPage: false,
              businessId: 'biz_01j...',
            },
          ],
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );
