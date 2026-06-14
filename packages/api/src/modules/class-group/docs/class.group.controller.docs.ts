import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { RegisterClassGroupDto } from '../dto/create.class.group.dto';
import { EditClassGroupDto } from '../dto/edit.class.group.dto';

export const CreateClassGroupDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create a new class group for the authenticated business',
    }),
    ApiBody({ type: RegisterClassGroupDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Class group created successfully',
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
      description: 'A class group with this name already exists for this business',
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

export const EditClassGroupDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Edit a class group name and its assigned classes' }),
    ApiBody({ type: EditClassGroupDto }),
    ApiParam({
      name: 'classGroupId',
      description: 'Class Group ID',
      example: 'grp_01j...',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Class group updated successfully',
      schema: {
        example: {
          data: null,
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Class group not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'A class group with this name already exists for this business',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const DeleteClassGroupDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Hard delete a class group by ID' }),
    ApiParam({
      name: 'classGroupId',
      description: 'Class Group ID',
      example: 'grp_01j...',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Class group deleted successfully',
      schema: {
        example: {
          data: null,
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Class group not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const FindAllClassGroupsByBusinessDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all class groups for a business' }),
    ApiParam({
      name: 'businessId',
      description: 'Business ID',
      example: 'biz_01j...',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Class groups retrieved successfully',
      schema: {
        example: {
          data: [
            {
              id: 'grp_01j...',
              name: 'Morning Classes',
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
