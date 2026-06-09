import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
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
import { AssignServiceToGroupDto } from './dto/assign.service.to.group.dto';
import {
  AssignServiceToGroupDocs,
  RemoveServiceFromGroupDocs,
  FindServicesByGroupDocs,
} from './docs/service.group.assignment.controller.docs';
import { ServiceGroupAssignmentUseCasesFactory } from './factory/service.group.assignment.usecases.factory';
import type {
  ServiceGroupAssignmentResponse,
  FindServicesByGroupResponse,
} from '@pikslots/shared';

@ApiTags('Service Group Assignments')
@Controller('')
export class ServiceGroupAssignmentController {
  constructor(
    private readonly useCasesFactory: ServiceGroupAssignmentUseCasesFactory,
    private readonly securityContext: SecurityContext,
  ) {}

  @AssignServiceToGroupDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Post(SERVICE_GROUP_ASSIGNMENT_ENDPOINTS.ASSIGN_SERVICE)
  async assignServiceToGroup(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: AssignServiceToGroupDto,
  ): Promise<PikslotsBaseErrorResponse | PikslotsBaseResponse<ServiceGroupAssignmentResponse>> {
    const result = await this.useCasesFactory.assignServiceToGroupUseCase.execute({
      serviceId: dto.serviceId,
      serviceGroupId: dto.serviceGroupId,
      businessId: dto.businessId,
      createdBy: this.securityContext.userId,
    });

    if (!result.ok) {
      const errorResponse = mapServiceGroupAssignmentError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    const a = result.value;
    res.status(HttpStatus.CREATED);
    return new PikslotsBaseResponse<ServiceGroupAssignmentResponse>(
      { id: a.id, serviceId: a.serviceId, serviceGroupId: a.serviceGroupId, businessId: a.businessId },
      HttpStatus.CREATED,
    );
  }

  @RemoveServiceFromGroupDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Delete(SERVICE_GROUP_ASSIGNMENT_ENDPOINTS.REMOVE_SERVICE)
  async removeServiceFromGroup(
    @Res({ passthrough: true }) res: Response,
    @Param('serviceGroupId') serviceGroupId: string,
    @Param('serviceId') serviceId: string,
  ): Promise<PikslotsBaseErrorResponse | PikslotsBaseResponse<void>> {
    const result = await this.useCasesFactory.removeServiceFromGroupUseCase.execute({
      serviceId,
      serviceGroupId,
      deletedBy: this.securityContext.userId,
    });

    if (!result.ok) {
      const errorResponse = mapServiceGroupAssignmentError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<void>(undefined, HttpStatus.OK);
  }

  @FindServicesByGroupDocs()
  @Get(SERVICE_GROUP_ASSIGNMENT_ENDPOINTS.FIND_BY_GROUP)
  async findServicesByGroup(
    @Res({ passthrough: true }) res: Response,
    @Param('serviceGroupId') serviceGroupId: string,
  ): Promise<PikslotsBaseErrorResponse | PikslotsBaseResponse<FindServicesByGroupResponse>> {
    const result = await this.useCasesFactory.findServicesByGroupUseCase.execute(serviceGroupId);

    if (!result.ok) {
      const errorResponse = mapServiceGroupAssignmentError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<FindServicesByGroupResponse>(
      result.value.map((a) => ({
        id: a.id,
        serviceId: a.serviceId,
        serviceGroupId: a.serviceGroupId,
        businessId: a.businessId,
      })),
      HttpStatus.OK,
    );
  }
}
