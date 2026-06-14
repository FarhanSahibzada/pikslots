import {
  Controller,
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
import { SERVICE_GROUP_ASSIGNMENT_ENDPOINTS } from '@pikslots/shared';
import { mapServiceGroupAssignmentError } from './errors/service.group.assignment.errors.map';
import {
  FindServicesByGroupDocs,
  FindGroupsByServiceDocs,
} from './docs/service.group.assignment.controller.docs';
import { ServiceGroupAssignmentUseCasesFactory } from './factory/service.group.assignment.usecases.factory';
import type {
  FindServicesByGroupResponse,
  ServiceGroupNameResponse,
  ServiceNameResponse,
} from '@pikslots/shared';

@ApiTags('Service Group Assignments')
@Controller('')
export class ServiceGroupAssignmentController {
  constructor(
    private readonly useCasesFactory: ServiceGroupAssignmentUseCasesFactory,
    private readonly securityContext: SecurityContext,
  ) {}

  @FindGroupsByServiceDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Standard', 'Enhanced')
  @Get(SERVICE_GROUP_ASSIGNMENT_ENDPOINTS.FIND_GROUPS_BY_SERVICE)
  async findGroupsByService(
    @Res({ passthrough: true }) res: Response,
    @Param('serviceId') serviceId: string,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<ServiceGroupNameResponse[]>
  > {
    const result =
      await this.useCasesFactory.findGroupsByServiceUseCase.execute(serviceId);

    if (!result.ok) {
      const errorResponse = mapServiceGroupAssignmentError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<ServiceGroupNameResponse[]>(
      result.value,
      HttpStatus.OK,
    );
  }

  @FindServicesByGroupDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Standard', 'Enhanced')
  @Get(SERVICE_GROUP_ASSIGNMENT_ENDPOINTS.FIND_BY_GROUP)
  async findServicesByGroup(
    @Res({ passthrough: true }) res: Response,
    @Param('serviceGroupId') serviceGroupId: string,
  ): Promise<
    | PikslotsBaseErrorResponse
    | PikslotsBaseResponse<FindServicesByGroupResponse>
  > {
    const result =
      await this.useCasesFactory.findServicesByGroupUseCase.execute(
        serviceGroupId,
      );

    if (!result.ok) {
      const errorResponse = mapServiceGroupAssignmentError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<ServiceNameResponse[]>(
      result.value.map((s) => ({ id: s.id, name: s.title })),
      HttpStatus.OK,
    );
  }
}
