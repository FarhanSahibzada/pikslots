import { HttpStatus, applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { RegisterBookingDto } from '../dto/register.booking.dto';
import { EditBookingDto } from '../dto/edit.booking.dto';

export const RegisterBookingDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Register a new booking' }),
    ApiBody({ type: RegisterBookingDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Booking registered successfully',
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
      description: 'A booking already exists for this time slot',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Caller is not authorized to register this booking',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const FindAllBookingsByBusinessForUserDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all bookings for a business, optionally scoped to a user',
    }),
    ApiParam({
      name: 'businessId',
      description: 'Business ID',
      example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7b',
    }),
    ApiParam({
      name: 'userId',
      description: 'User ID',
      example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7c',
    }),
    ApiQuery({
      name: 'startDateTime',
      required: true,
      description: 'Start date-time in ISO 8601 format',
      example: '2025-06-01',
    }),
    ApiQuery({
      name: 'endDateTime',
      required: true,
      description: 'End date-time in ISO 8601 format',
      example: '2025-06-30',
    }),
    ApiQuery({
      name: 'timezone',
      required: true,
      description: 'IANA timezone of the caller',
      example: 'Asia/Karachi',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Bookings retrieved successfully',
      schema: {
        example: {
          data: [
            {
              id: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7b',
              bookingId: 'BK3KX9M2P',
              bookingDate: '2025-06-16',
              bookingStartTime: '2025-06-16T09:00:00.000Z',
              bookingEndTime: '2025-06-16T10:00:00.000Z',
              userId: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7e',
              serviceSnapshot: {
                title: 'Haircut',
                durationInMins: 30,
                cost: 2500,
              },
              serviceId: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7c',
              customerId: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7d',
            },
          ],
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Caller is not authorized to view these bookings',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const FindBookingByIdDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get a booking by ID' }),
    ApiParam({
      name: 'bookingId',
      description: 'Booking ID',
      example: 'BK3KX9M2P',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Booking retrieved successfully',
      schema: {
        example: {
          data: {
            id: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7b',
            bookingId: 'BK3KX9M2P',
            bookingDate: '2025-06-16',
            bookingStartTime: '2025-06-16T09:00:00.000Z',
            bookingEndTime: '2025-06-16T10:00:00.000Z',
            businessId: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7b',
            serviceSnapshot: {
              title: 'Haircut',
              durationInMins: 30,
              cost: 2500,
            },
            serviceId: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7c',
            customerId: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7d',
            userId: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7e',
            createdAt: '2026-01-01T00:00:00.000Z',
            createdBy: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7f',
            updatedAt: '2026-01-01T00:00:00.000Z',
            updatedBy: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7f',
            deletedAt: null,
            deletedBy: null,
            isDeleted: false,
          },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Booking not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Caller is not authorized to view this booking',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const EditBookingDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Edit an existing booking' }),
    ApiParam({
      name: 'bookingId',
      description: 'Booking ID',
      example: 'BK3KX9M2P',
    }),
    ApiBody({ type: EditBookingDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Booking updated successfully',
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
      description: 'Booking not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'A booking already exists for this time slot',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Caller is not authorized to edit this booking',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const DeleteBookingDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete a booking by ID' }),
    ApiParam({
      name: 'bookingId',
      description: 'Booking ID',
      example: 'BK-01j...',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Booking deleted successfully',
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
      description: 'Booking not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Caller is not authorized to delete this booking',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );
