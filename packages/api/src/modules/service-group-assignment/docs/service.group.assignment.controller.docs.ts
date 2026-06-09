import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { AssignServiceToGroupDto } from '../dto/assign.service.to.group.dto';

export const AssignServiceToGroupDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Assign a service to a service group' }),
    ApiBody({ type: AssignServiceToGroupDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Service assigned to group successfully',
      schema: {
        example: {
          data: {
            id: 'asg_01j...',
            serviceId: 'svc_01j...',
            serviceGroupId: 'grp_01j...',
            businessId: 'biz_01j...',
          },
          statusCode: 201,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Service is already assigned to this group',
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

export const RemoveServiceFromGroupDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Remove a service from a service group' }),
    ApiParam({ name: 'serviceGroupId', description: 'Service group ID', example: 'grp_01j...' }),
    ApiParam({ name: 'serviceId', description: 'Service ID to remove', example: 'svc_01j...' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Service removed from group successfully',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Assignment not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const FindServicesByGroupDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all active service assignments for a group' }),
    ApiParam({ name: 'serviceGroupId', description: 'Service group ID', example: 'grp_01j...' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Assignments retrieved successfully',
      schema: {
        example: {
          data: [
            {
              id: 'asg_01j...',
              serviceId: 'svc_01j...',
              serviceGroupId: 'grp_01j...',
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
