import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { LoginUserDto } from '../dto/login.user.dto';
import { RefreshUserSessionDto } from '../dto/refresh.user.session.dto';
import { InviteUserDto } from '../dto/invite.user.dto';

export const InviteUserDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Invite a new user to the platform' }),
    ApiBody({ type: InviteUserDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'User invited successfully',
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
      description: 'User with this email or username already exists',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Inviter does not have permission to assign the requested role',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const GetUserProfileDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get the authenticated user profile' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User profile returned successfully',
      schema: {
        example: {
          data: {
            id: 'uuid',
            username: 'afaqjaved',
            email: 'afaq@afaqjaved.com',
            phone: null,
            name: { firstName: 'Afaq', lastName: 'Javed' },
            role: 'Platform Owner',
            avatarUrl: null,
            bookingUrl: 'platform-owner',
          },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Account is suspended or inactive',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Missing or invalid access token',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const LoginUserDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Login with username/email and password' }),
    ApiBody({ type: LoginUserDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Login successful — returns access and refresh tokens',
      schema: {
        example: {
          data: {
            accessToken: '<jwt>',
            refreshToken: '<jwt>',
          },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Invalid credentials',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const RefreshUserSessionDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Rotate refresh token and issue a new token pair',
    }),
    ApiBody({ type: RefreshUserSessionDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description:
        'Token rotation successful — returns a new access and refresh token',
      schema: {
        example: {
          data: {
            accessToken: '<jwt>',
            refreshToken: '<jwt>',
          },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Refresh token is expired or has been revoked',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Refresh token is malformed or has an invalid signature',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const LogoutUserDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Logout and clear the refresh token cookie' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Logged out successfully',
      schema: {
        example: {
          data: { message: 'success' },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
  );
