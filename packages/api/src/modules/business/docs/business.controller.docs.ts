import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { RegisterBusinessDto } from '../dto/register.business.dto';

export const GetAllBusinessesDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all registered businesses (superAdmin only)' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'List of all businesses returned successfully',
      schema: {
        example: {
          data: {
            businesses: [
              {
                id: 'uuid',
                name: "Joe's Barbershop",
                slug: 'joes-barbershop',
                email: 'contact@joesbarbershop.com',
                industry: 'salon_and_beauty',
                status: 'active',
                subscriptionPlan: 'free',
                createdAt: '2026-01-01T00:00:00.000Z',
              },
            ],
            total: 1,
          },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Access denied — superAdmin role required',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Database or infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const RegisterBusinessDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Register a new business' }),
    ApiBody({ type: RegisterBusinessDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Business registered successfully',
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
      description: 'A business with this slug or email already exists',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
      type: PikslotsBaseErrorResponse,
    }),
  );
