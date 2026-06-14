import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { RegisterClassDto } from '../dto/register.class.dto';
import { EditClassDto } from '../dto/edit.class.dto';

export const RegisterClassDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Register a new class for the authenticated business' }),
    ApiBody({ type: RegisterClassDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Class registered successfully',
      schema: {
        example: {
          data: { message: 'success' },
          statusCode: 201,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Caller is not authorized to register a class',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const EditClassDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update an existing class' }),
    ApiParam({ name: 'classId', description: 'Class ID', example: 'cls_01j...' }),
    ApiBody({ type: EditClassDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Class updated successfully',
      schema: {
        example: {
          data: { message: 'success' },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Class not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Caller is not authorized to edit this class',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const DeleteClassDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete a class by ID' }),
    ApiParam({ name: 'classId', description: 'Class ID', example: 'cls_01j...' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Class deleted successfully',
      schema: {
        example: {
          data: { message: 'success' },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Class not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const FindAllClassesByBusinessDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all classes for a business' }),
    ApiParam({ name: 'businessId', description: 'Business ID', example: 'biz_01j...' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Classes retrieved successfully',
      schema: {
        example: {
          data: [
            {
              id: 'cls_01j...',
              title: 'Yoga Basics',
              description: '60-min beginner yoga',
              images: [],
              durationInMins: 60,
              seats: 10,
              cost: 1500,
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
