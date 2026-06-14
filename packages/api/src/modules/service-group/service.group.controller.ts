import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
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
import { mapServiceGroupError } from './errors/service.group.errors.map';
import { SERVICE_GROUP_ENDPOINTS } from '@pikslots/shared';
import { RegisterServiceGroupDto } from './dto/create.service.group.dto';
import { EditServiceGroupDto } from './dto/edit.service.group.dto';
import {
  CreateServiceGroupDocs,
  DeleteServiceGroupDocs,
  EditServiceGroupDocs,
  FindAllServiceGroupsByBusinessDocs,
} from './docs/service.group.controller.docs';
import { ServiceGroupUseCasesFactory } from './factory/service.group.usecases.factory';
import type {
  RegisterServiceGroupResponse,
  ServiceGroupResponse,
} from '@pikslots/shared';

@ApiTags('Service Groups')
@Controller('')
export class ServiceGroupController {
  constructor(
    private readonly serviceGroupUseCasesFactory: ServiceGroupUseCasesFactory,
    private readonly securityContext: SecurityContext,
  ) {}

  @CreateServiceGroupDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Post(SERVICE_GROUP_ENDPOINTS.REGISTER)
  async registerServiceGroup(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: RegisterServiceGroupDto,
  ): Promise<
    | PikslotsBaseErrorResponse
    | PikslotsBaseResponse<RegisterServiceGroupResponse>
  > {
    const result =
      await this.serviceGroupUseCasesFactory.registerServiceGroupUseCase.execute(
        {
          name: dto.name,
          businessId: dto.businessId,
          associatedServices: dto.associatedServices,
          createdBy: this.securityContext.userId,
        },
      );

    if (!result.ok) {
      const errorResponse = mapServiceGroupError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.CREATED);
    return new PikslotsBaseResponse<RegisterServiceGroupResponse>(
      result.value,
      HttpStatus.CREATED,
    );
  }

  @EditServiceGroupDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Patch(SERVICE_GROUP_ENDPOINTS.EDIT)
  async editServiceGroup(
    @Res({ passthrough: true }) res: Response,
    @Param('serviceGroupId') serviceGroupId: string,
    @Body() dto: EditServiceGroupDto,
  ): Promise<PikslotsBaseErrorResponse | PikslotsBaseResponse<void>> {
    const result =
      await this.serviceGroupUseCasesFactory.editServiceGroupUseCase.execute({
        serviceGroupId,
        name: dto.name,
        businessId: dto.businessId,
        serviceIds: dto.serviceIds,
        updatedBy: this.securityContext.userId,
      });

    if (!result.ok) {
      const errorResponse = mapServiceGroupError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<void>(undefined, HttpStatus.OK);
  }

  @DeleteServiceGroupDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Delete(SERVICE_GROUP_ENDPOINTS.DELETE)
  async deleteServiceGroup(
    @Res({ passthrough: true }) res: Response,
    @Param('serviceGroupId') serviceGroupId: string,
  ): Promise<PikslotsBaseErrorResponse | PikslotsBaseResponse<void>> {
    const result =
      await this.serviceGroupUseCasesFactory.deleteServiceGroupUseCase.execute(
        serviceGroupId,
      );

    if (!result.ok) {
      const errorResponse = mapServiceGroupError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<void>(undefined, HttpStatus.OK);
  }

  @FindAllServiceGroupsByBusinessDocs()
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Enhanced', 'Standard')
  @Get(SERVICE_GROUP_ENDPOINTS.FIND_ALL_BY_BUSINESS)
  async findAllByBusiness(
    @Res({ passthrough: true }) res: Response,
    @Param('businessId') businessId: string,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<ServiceGroupResponse[]>
  > {
    const result =
      await this.serviceGroupUseCasesFactory.findAllServiceGroupsByBusinessUseCase.execute(
        businessId,
      );

    if (!result.ok) {
      const errorResponse = mapServiceGroupError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<ServiceGroupResponse[]>(
      result.value.map((g) => ({
        id: g.id,
        name: g.name,
        businessId: g.businessId,
      })),
      HttpStatus.OK,
    );
  }
}
