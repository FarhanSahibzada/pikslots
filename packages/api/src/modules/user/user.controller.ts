import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { mapUserError } from './errors/user.errors.map';
import { USER_ENDPOINTS } from '@pikslots/shared';
import { LoginUserDto } from './dto/login.user.dto';
import { InviteUserDto } from './dto/invite.user.dto';
import { UserUsecasesFactory } from './factory/user.usecases.factory';
import {
  GetAllBusinessOwnersDocs,
  GetBusinessUsersDocs,
  GetUsersByRoleDocs,
  GetUserProfileDocs,
  InviteUserDocs,
  LoginUserDocs,
  RefreshUserSessionDocs,
  LogoutUserDocs,
  UpdateUserWorkingHoursDocs,
} from './docs/user.controller.docs';
import { GetUsersByRoleDto } from './dto/get.users.by.role.dto';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { PikslotsBaseResponse } from 'src/shared/types/base.response';
import type {
  AcceptInviteResponse,
  InviteUserResponse,
  LoginUserResponse,
  LogoutUserResponse,
  RefreshUserSessionResponse,
  RequestInviteOtpResponse,
  UpdateUserWorkingHoursResponse,
  UserSummary,
} from '@pikslots/shared';
import { UserResponseMapper } from './mappers/user.response.mapper';
import { UpdateUserWorkingHoursDto } from './dto/update.user.working.hours.dto';
import { RequestInviteOtpDto } from './dto/request.invite.otp.dto';
import { AcceptInviteDto } from './dto/accept.invite.dto';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { JwtInviteService } from 'src/shared/security/jwt/jwt.invite.service';
import { InviteJwtPayload } from '@pikslots/shared';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/shared/config/env';
import { RolesGuard } from 'src/shared/security/guards/roles.guard';
import { Roles } from 'src/shared/security/guards/roles.decorator';

@ApiTags('Users')
@Controller('')
export class UserController {
  constructor(
    private readonly userUseCaseFactory: UserUsecasesFactory,
    private readonly configService: ConfigService<Env, true>,
    private readonly securityContext: SecurityContext,
    private readonly jwtInviteService: JwtInviteService,
  ) {}

  @GetAllBusinessOwnersDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner')
  @Get(USER_ENDPOINTS.BUSINESS_OWNERS)
  async getAllBusinessOwners(
    @Res({ passthrough: true }) res: Response,
  ): Promise<PikslotsBaseErrorResponse | PikslotsBaseResponse<UserSummary[]>> {
    const result =
      await this.userUseCaseFactory.getAllUsersByRoleUseCase.execute(
        this.securityContext.role,
        'Business Owner',
      );

    if (!result.ok) {
      const errorResponse = mapUserError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse(
      result.value.map(UserResponseMapper.toUserSummary),
      HttpStatus.OK,
    );
  }

  @GetUsersByRoleDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Get(USER_ENDPOINTS.BY_ROLE)
  async getUsersByRole(
    @Query() query: GetUsersByRoleDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<UserSummary[]>
  > {
    const result =
      await this.userUseCaseFactory.getAllUsersByRoleUseCase.execute(
        this.securityContext.role,
        query.role,
      );

    if (!result.ok) {
      const errorResponse = mapUserError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse(
      result.value.map(UserResponseMapper.toUserSummary),
      HttpStatus.OK,
    );
  }

  @GetBusinessUsersDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Get(USER_ENDPOINTS.BUSINESS_USERS)
  async getBusinessUsers(
    @Param('businessId') businessId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<UserSummary[]>
  > {
    const result =
      await this.userUseCaseFactory.findAllUsersInsideBusinessUseCase.execute(
        businessId,
      );

    if (!result.ok) {
      const errorResponse = mapUserError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse(
      result.value.map(UserResponseMapper.toUserSummary),
      HttpStatus.OK,
    );
  }

  @GetUserProfileDocs()
  @Get(USER_ENDPOINTS.ME)
  async getUserProfile(
    @Res({ passthrough: true }) res: Response,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<UserSummary>
  > {
    const result = await this.userUseCaseFactory.getUserProfileUseCase.execute(
      this.securityContext.userId,
    );

    if (!result.ok) {
      const errorResponse = mapUserError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<UserSummary>(
      UserResponseMapper.toUserSummary(result.value),
      HttpStatus.OK,
    );
  }

  @InviteUserDocs()
  @Post(USER_ENDPOINTS.INVITE)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
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
  @Post(USER_ENDPOINTS.LOGIN)
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
      path: USER_ENDPOINTS.REFRESH,
    });

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<LoginUserResponse>(
      { accessToken: result.value.accessToken },
      HttpStatus.OK,
    );
  }

  @RefreshUserSessionDocs()
  @Post(USER_ENDPOINTS.REFRESH)
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
      path: USER_ENDPOINTS.REFRESH,
    });

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<RefreshUserSessionResponse>(
      { accessToken: result.value.accessToken },
      HttpStatus.OK,
    );
  }

  @UpdateUserWorkingHoursDocs()
  @Patch(USER_ENDPOINTS.UPDATE_WORKING_HOURS)
  async updateWorkingHours(
    @Res({ passthrough: true }) res: Response,
    @Param('userId') userId: string,
    @Body() dto: UpdateUserWorkingHoursDto,
  ): Promise<
    | PikslotsBaseErrorResponse
    | PikslotsBaseResponse<UpdateUserWorkingHoursResponse>
  > {
    const result =
      await this.userUseCaseFactory.updateUserWorkingHoursUseCase.execute({
        userId,
        userWorkingHours: dto,
      });

    if (!result.ok) {
      const errorResponse = mapUserError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    const user = result.value;
    const wh = user.userWorkingHours;
    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<UpdateUserWorkingHoursResponse>(
      {
        monday: wh.monday,
        tuesday: wh.tuesday,
        wednesday: wh.wednesday,
        thursday: wh.thursday,
        friday: wh.friday,
        saturday: wh.saturday,
        sunday: wh.sunday,
      },
      HttpStatus.OK,
    );
  }

  @Post(USER_ENDPOINTS.REQUEST_INVITE_OTP)
  async requestInviteOtp(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: RequestInviteOtpDto,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<RequestInviteOtpResponse>
  > {
    const result =
      await this.userUseCaseFactory.requestInviteOtpUseCase.execute({
        token: dto.token,
      });

    if (!result.ok) {
      const errorResponse = mapUserError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<RequestInviteOtpResponse>(
      result.value,
      HttpStatus.OK,
    );
  }

  @Post(USER_ENDPOINTS.ACCEPT_INVITE)
  async acceptInvite(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: AcceptInviteDto,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<AcceptInviteResponse>
  > {
    const tokenResult =
      this.jwtInviteService.verifyInviteToken<InviteJwtPayload>(dto.token);
    if (!tokenResult.ok) {
      const errorResponse = mapUserError(tokenResult.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    const result = await this.userUseCaseFactory.acceptInviteUseCase.execute({
      userId: tokenResult.value.userId,
      businessId: tokenResult.value.businessId,
      otp: dto.otp,
      newPassword: dto.newPassword,
    });

    if (!result.ok) {
      const errorResponse = mapUserError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<AcceptInviteResponse>(
      result.value,
      HttpStatus.OK,
    );
  }

  @LogoutUserDocs()
  @HttpCode(HttpStatus.OK)
  @Post(USER_ENDPOINTS.LOGOUT)
  logout(
    @Res({ passthrough: true }) res: Response,
  ): PikslotsBaseResponse<LogoutUserResponse> {
    res.clearCookie('jid', { path: USER_ENDPOINTS.REFRESH });
    return new PikslotsBaseResponse<LogoutUserResponse>(
      { message: 'success' },
      HttpStatus.OK,
    );
  }
}
