import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { AssignUserToServiceDto } from '../dto/assign.user.to.service.dto';

export const AssignUserToServiceDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Assign a user to a service' }),
    ApiBody({ type: AssignUserToServiceDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'User assigned to service successfully',
      schema: {
        example: {
          data: {
            id: 'sua_01j...',
            serviceId: 'svc_01j...',
            userId: 'usr_01j...',
            businessId: 'biz_01j...',
          },
          statusCode: 201,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'User is already assigned to this service',
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

export const RemoveUserFromServiceDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Remove a user from a service' }),
    ApiParam({
      name: 'serviceId',
      description: 'Service ID',
      example: 'svc_01j...',
    }),
    ApiParam({
      name: 'userId',
      description: 'User ID to remove',
      example: 'usr_01j...',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User removed from service successfully',
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

export const FindUsersByServiceDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all users assigned to a service' }),
    ApiParam({
      name: 'serviceId',
      description: 'Service ID',
      example: 'svc_01j...',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Users retrieved successfully',
      schema: {
        example: {
          data: [{ id: 'usr_01j...', firstName: 'Jane', lastName: 'Doe' }],
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

export const FindServicesByUserDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all services a user is assigned to' }),
    ApiParam({ name: 'userId', description: 'User ID', example: 'usr_01j...' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Services retrieved successfully',
      schema: {
        example: {
          data: [{ id: 'svc_01j...', title: 'Haircut' }],
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
