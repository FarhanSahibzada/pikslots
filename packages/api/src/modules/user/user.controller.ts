import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  HttpCode,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { mapUserError } from './errors/user.errors.map';
import { LoginUserDto } from './dto/login.user.dto';
import { InviteUserDto } from './dto/invite.user.dto';
import { UserUsecasesFactory } from './factory/user.usecases.factory';
import {
  GetUserProfileDocs,
  InviteUserDocs,
  LoginUserDocs,
  RefreshUserSessionDocs,
  LogoutUserDocs,
} from './docs/user.controller.docs';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { PikslotsBaseResponse } from 'src/shared/types/base.response';
import type {
  GetUserProfileResponse,
  InviteUserResponse,
  LoginUserResponse,
  LogoutUserResponse,
  RefreshUserSessionResponse,
} from '@pikslots/shared';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/shared/config/env';

@ApiTags('Users')
@Controller('/users')
export class UserController {
  constructor(
    private readonly userUseCaseFactory: UserUsecasesFactory,
    private readonly configService: ConfigService<Env, true>,
    private readonly securityContext: SecurityContext,
  ) {}

  @GetUserProfileDocs()
  @Get('/me')
  async getUserProfile(
    @Res({ passthrough: true }) res: Response,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<GetUserProfileResponse>
  > {
    const result = await this.userUseCaseFactory.getUserProfileUseCase.execute(
      this.securityContext.userId,
    );

    if (!result.ok) {
      const errorResponse = mapUserError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    const user = result.value;
    res.status(HttpStatus.OK);

    return new PikslotsBaseResponse<GetUserProfileResponse>(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        name: { firstName: user.name.firstName, lastName: user.name.lastName },
        role: user.role,
        avatarUrl: user.avatarUrl,
        bookingUrl: user.bookingUrl,
      },
      HttpStatus.OK,
    );
  }

  @InviteUserDocs()
  @Post('/invite')
  async inviteUser(
    @Res({ passthrough: true }) res: Response,
    @Body() inviteUserDto: InviteUserDto,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<InviteUserResponse>
  > {
    const result =
      await this.userUseCaseFactory.inviteUserUseCase.execute(inviteUserDto);

    if (!result.ok) {
      const errorResponse = mapUserError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.CREATED);
    return new PikslotsBaseResponse(result.value, HttpStatus.CREATED);
  }

  @LoginUserDocs()
  @Post('/login')
  async loginUser(
    @Res({ passthrough: true }) res: Response,
    @Body()
    loginUserDto: LoginUserDto,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<LoginUserResponse>
  > {
    const result =
      await this.userUseCaseFactory.loginUserUseCase.execute(loginUserDto);

    if (!result.ok) {
      const errorResponse = mapUserError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.cookie('jid', result.value.refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/users/refresh',
    });

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<LoginUserResponse>(
      { accessToken: result.value.accessToken },
      HttpStatus.OK,
    );
  }

  @RefreshUserSessionDocs()
  @Post('/refresh')
  async refreshUserSession(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<RefreshUserSessionResponse>
  > {
    const currentRefreshToken = req.cookies?.jid;
    if (!currentRefreshToken) throw new UnauthorizedException();
    const result =
      await this.userUseCaseFactory.refreshUserSessionUseCase.execute({
        currentRefreshToken,
      });

    if (!result.ok) {
      const errorResponse = mapUserError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.cookie('jid', result.value.refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/users/refresh',
    });

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<RefreshUserSessionResponse>(
      { accessToken: result.value.accessToken },
      HttpStatus.OK,
    );
  }

  @LogoutUserDocs()
  @HttpCode(HttpStatus.OK)
  @Post('/logout')
  logout(
    @Res({ passthrough: true }) res: Response,
  ): PikslotsBaseResponse<LogoutUserResponse> {
    res.clearCookie('jid', { path: '/users/refresh' });
    return new PikslotsBaseResponse<LogoutUserResponse>(
      { message: 'success' },
      HttpStatus.OK,
    );
  }
}
