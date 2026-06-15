import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { RegisterCustomerDto } from '../dto/register.customer.dto';
import { EditCustomerDto } from '../dto/edit.customer.dto';

export const RegisterCustomerDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Register a new customer for a business' }),
    ApiBody({ type: RegisterCustomerDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Customer registered successfully',
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
      description:
        'A customer with this email already exists for this business',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Caller is not authorized to register a customer',
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

export const EditCustomerDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Edit an existing customer' }),
    ApiParam({
      name: 'customerId',
      description: 'Customer ID',
      example: 'cus_01j...',
    }),
    ApiBody({ type: EditCustomerDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Customer updated successfully',
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
      description: 'Customer not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Caller is not authorized to edit this customer',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const DeleteCustomerDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete a customer by ID' }),
    ApiParam({
      name: 'customerId',
      description: 'Customer ID',
      example: 'cus_01j...',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Customer deleted successfully',
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
      description: 'Customer not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Caller is not authorized to delete this customer',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const FindAllCustomersByBusinessDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all customers for a business' }),
    ApiParam({
      name: 'businessId',
      description: 'Business ID',
      example: 'biz_01j...',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Customers retrieved successfully',
      schema: {
        example: {
          data: [
            {
              id: 'cus_01j...',
              firstName: 'John',
              lastName: 'Doe',
              profileImageUrl: null,
              email: 'john@example.com',
              additionalEmail: null,
              primaryPhone: '+15551234567',
              additionalPhone: null,
              company: 'Acme Corp',
              country: 'United States',
              address: '123 Main St',
              city: 'New York',
              state: 'NY',
              zipCode: '10001',
              customerSocialLinks: {},
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
