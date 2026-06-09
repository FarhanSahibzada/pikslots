import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { CreateServiceGroupDto } from '../dto/create.service.group.dto';

export const CreateServiceGroupDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a new service group for the authenticated business' }),
    ApiBody({ type: CreateServiceGroupDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Service group created successfully',
      schema: {
        example: {
          data: { id: 'grp_01j...', name: 'Color Services', businessId: 'biz_01j...' },
          statusCode: 201,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'A service group with this name already exists for this business',
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

export const FindAllServiceGroupsByBusinessDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all service groups for a business' }),
    ApiParam({ name: 'businessId', description: 'Business ID', example: 'biz_01j...' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Service groups retrieved successfully',
      schema: {
        example: {
          data: [{ id: 'grp_01j...', name: 'Color Services', businessId: 'biz_01j...' }],
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
