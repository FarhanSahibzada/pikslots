import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';

export const FindClassesByGroupDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all classes belonging to a class group' }),
    ApiParam({
      name: 'classGroupId',
      description: 'Class group ID',
      example: 'grp_01j...',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Classes retrieved successfully',
      schema: {
        example: {
          data: [{ id: 'cls_01j...', name: 'Yoga Basics' }],
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

export const FindGroupsByClassDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all class groups a class belongs to' }),
    ApiParam({
      name: 'classId',
      description: 'Class ID',
      example: 'cls_01j...',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Groups retrieved successfully',
      schema: {
        example: {
          data: [{ id: 'grp_01j...', name: 'Morning Classes' }],
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
