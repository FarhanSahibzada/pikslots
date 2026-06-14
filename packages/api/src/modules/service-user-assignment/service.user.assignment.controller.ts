import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { PikslotsBaseResponse } from 'src/shared/types/base.response';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { RolesGuard } from 'src/shared/security/guards/roles.guard';
import { Roles } from 'src/shared/security/guards/roles.decorator';
import { SERVICE_USER_ASSIGNMENT_ENDPOINTS } from '@pikslots/shared';
import { mapServiceUserAssignmentError } from './errors/service.user.assignment.errors.map';

import {
  RemoveUserFromServiceDocs,
  FindUsersByServiceDocs,
  FindServicesByUserDocs,
} from './docs/service.user.assignment.controller.docs';
import { ServiceUserAssignmentUseCasesFactory } from './factory/service.user.assignment.usecases.factory';
import type { UserNameResponse, ServiceTitleResponse } from '@pikslots/shared';

@ApiTags('Service User Assignments')
@Controller('')
export class ServiceUserAssignmentController {
  constructor(
    private readonly useCasesFactory: ServiceUserAssignmentUseCasesFactory,
    private readonly securityContext: SecurityContext,
  ) {}

  @RemoveUserFromServiceDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Delete(SERVICE_USER_ASSIGNMENT_ENDPOINTS.REMOVE_USER)
  async removeUserFromService(
    @Res({ passthrough: true }) res: Response,
    @Param('serviceId') serviceId: string,
    @Param('userId') userId: string,
  ): Promise<PikslotsBaseErrorResponse | PikslotsBaseResponse<void>> {
    const result =
      await this.useCasesFactory.removeUserFromServiceUseCase.execute({
        serviceId,
        userId,
        deletedBy: this.securityContext.userId,
      });

    if (!result.ok) {
      const errorResponse = mapServiceUserAssignmentError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<void>(undefined, HttpStatus.OK);
  }

  @FindUsersByServiceDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Standard', 'Enhanced')
  @Get(SERVICE_USER_ASSIGNMENT_ENDPOINTS.FIND_BY_SERVICE)
  async findUsersByService(
    @Res({ passthrough: true }) res: Response,
    @Param('serviceId') serviceId: string,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<UserNameResponse[]>
  > {
    const result =
      await this.useCasesFactory.findUsersByServiceUseCase.execute(serviceId);

    if (!result.ok) {
      const errorResponse = mapServiceUserAssignmentError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<UserNameResponse[]>(
      result.value.map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
      })),
      HttpStatus.OK,
    );
  }

  @FindServicesByUserDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Enhanced', 'Standard')
  @Get(SERVICE_USER_ASSIGNMENT_ENDPOINTS.FIND_SERVICES_BY_USER)
  async findServicesByUser(
    @Res({ passthrough: true }) res: Response,
    @Param('userId') userId: string,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<ServiceTitleResponse[]>
  > {
    const result =
      await this.useCasesFactory.findServicesByUserUseCase.execute(userId);

    if (!result.ok) {
      const errorResponse = mapServiceUserAssignmentError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<ServiceTitleResponse[]>(
      result.value.map((s) => ({ id: s.id, title: s.title })),
      HttpStatus.OK,
    );
  }
}
