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
import { mapServiceGroupError } from './errors/service.group.errors.map';
import { SERVICE_GROUP_ENDPOINTS } from '@pikslots/shared';
import { CreateServiceGroupDto } from './dto/create.service.group.dto';
import {
  CreateServiceGroupDocs,
  FindAllServiceGroupsByBusinessDocs,
} from './docs/service.group.controller.docs';
import { ServiceGroupUseCasesFactory } from './factory/service.group.usecases.factory';
import type {
  FindAllServiceGroupsByBusinessResponse,
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
  @Post(SERVICE_GROUP_ENDPOINTS.CREATE)
  async createServiceGroup(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: CreateServiceGroupDto,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<ServiceGroupResponse>
  > {
    const result =
      await this.serviceGroupUseCasesFactory.createServiceGroupUseCase.execute({
        name: dto.name,
        businessId: dto.businessId,
        createdBy: this.securityContext.userId,
      });

    if (!result.ok) {
      const errorResponse = mapServiceGroupError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    const group = result.value;
    res.status(HttpStatus.CREATED);
    return new PikslotsBaseResponse<ServiceGroupResponse>(
      { id: group.id, name: group.name, businessId: group.businessId },
      HttpStatus.CREATED,
    );
  }

  @FindAllServiceGroupsByBusinessDocs()
  @Get(SERVICE_GROUP_ENDPOINTS.FIND_ALL_BY_BUSINESS)
  async findAllByBusiness(
    @Res({ passthrough: true }) res: Response,
    @Param('businessId') businessId: string,
  ): Promise<
    | PikslotsBaseErrorResponse
    | PikslotsBaseResponse<FindAllServiceGroupsByBusinessResponse>
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
    return new PikslotsBaseResponse<FindAllServiceGroupsByBusinessResponse>(
      result.value.map((g) => ({
        id: g.id,
        name: g.name,
        businessId: g.businessId,
      })),
      HttpStatus.OK,
    );
  }
}
