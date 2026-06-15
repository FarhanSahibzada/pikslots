import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';

export const FindServicesByGroupDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all services belonging to a group' }),
    ApiParam({
      name: 'serviceGroupId',
      description: 'Service group ID',
      example: 'grp_01j...',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Services retrieved successfully',
      schema: {
        example: {
          data: [{ id: 'svc_01j...', name: 'Haircut' }],
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

export const FindGroupsByServiceDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all groups a service belongs to' }),
    ApiParam({
      name: 'serviceId',
      description: 'Service ID',
      example: 'svc_01j...',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Groups retrieved successfully',
      schema: {
        example: {
          data: [{ id: 'grp_01j...', name: 'Morning Services' }],
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
