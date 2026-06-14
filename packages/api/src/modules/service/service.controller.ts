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
import { mapServiceError } from './errors/service.errors.map';
import { SERVICE_ENDPOINTS } from '@pikslots/shared';
import { RegisterServiceDto } from './dto/register.service.dto';
import {
  RegisterServiceDocs,
  FindAllServicesByBusinessDocs,
  EditServiceDocs,
  DeleteServiceDocs,
} from './docs/service.controller.docs';
import { ServiceUseCasesFactory } from './factory/service.usecases.factory';
import {
  RegisterServiceResponse,
  FindAllServicesByBusinessResponse,
  UpdateServiceResponse,
  DeleteServiceResponse,
} from '@pikslots/shared';
import { EditServiceDto } from './dto/edit.service.dto';

@ApiTags('Services')
@Controller('')
export class ServiceController {
  constructor(
    private readonly serviceUseCasesFactory: ServiceUseCasesFactory,
    private readonly securityContext: SecurityContext,
  ) {}

  @RegisterServiceDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Post(SERVICE_ENDPOINTS.REGISTER)
  async registerService(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: RegisterServiceDto,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<RegisterServiceResponse>
  > {
    const result =
      await this.serviceUseCasesFactory.registerServiceUseCase.execute({
        title: dto.title,
        description: dto.description,
        imagesUrls: dto.imagesUrls,
        durationInMins: dto.durationInMins,
        bufferTimeInMins: dto.bufferTimeInMins,
        cost: dto.cost,
        isHiddenFromBookingPage: dto.isHiddenFromBookingPage,
        associatedServiceGroups: dto.associatedServiceGroups,
        associatedUsers: dto.associatedUsers,
        businessId: dto.businessId,
        createdBy: this.securityContext.userId,
      });

    if (!result.ok) {
      const errorResponse = mapServiceError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.CREATED);

    return new PikslotsBaseResponse({ message: 'success' }, HttpStatus.CREATED);
  }

  @EditServiceDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Patch(SERVICE_ENDPOINTS.UPDATE)
  async editService(
    @Res({ passthrough: true }) res: Response,
    @Param('serviceId') serviceId: string,
    @Body() dto: EditServiceDto,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<UpdateServiceResponse>
  > {
    const result = await this.serviceUseCasesFactory.editServiceUseCase.execute(
      {
        id: serviceId,
        title: dto.title,
        description: dto.description,
        imagesUrls: dto.imagesUrls,
        durationInMins: dto.durationInMins,
        bufferTimeInMins: dto.bufferTimeInMins,
        cost: dto.cost,
        isHiddenFromBookingPage: dto.isHiddenFromBookingPage,
        associatedServiceGroups: dto.associatedServiceGroups,
        associatedUsers: dto.associatedUsers,
        businessId: dto.businessId,
        updatedBy: this.securityContext.userId,
      },
    );

    if (!result.ok) {
      const errorResponse = mapServiceError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<UpdateServiceResponse>(
      { message: 'success' },
      HttpStatus.OK,
    );
  }

  @DeleteServiceDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Delete(SERVICE_ENDPOINTS.DELETE)
  async deleteService(
    @Res({ passthrough: true }) res: Response,
    @Param('serviceId') serviceId: string,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<DeleteServiceResponse>
  > {
    const result =
      await this.serviceUseCasesFactory.deleteServiceUseCase.execute(serviceId);

    if (!result.ok) {
      const errorResponse = mapServiceError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);

    return new PikslotsBaseResponse<DeleteServiceResponse>(
      { message: 'success' },
      HttpStatus.OK,
    );
  }

  @FindAllServicesByBusinessDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Enhanced', 'Standard')
  @Get(SERVICE_ENDPOINTS.FIND_ALL_BY_BUSINESS)
  async findAllByBusiness(
    @Res({ passthrough: true }) res: Response,
    @Param('businessId') businessId: string,
  ): Promise<
    | PikslotsBaseErrorResponse
    | PikslotsBaseResponse<FindAllServicesByBusinessResponse>
  > {
    const result =
      await this.serviceUseCasesFactory.findAllServicesByBusinessUsecase.execute(
        businessId,
      );

    if (!result.ok) {
      const errorResponse = mapServiceError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<FindAllServicesByBusinessResponse>(
      result.value.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        images: s.images,
        durationInMins: s.durationInMins,
        bufferTimeInMins: s.bufferTimeInMins,
        cost: s.cost,
        isHiddenFromBookingPage: s.isHiddenFromBookingPage,
        businessId: s.businessId,
      })),
      HttpStatus.OK,
    );
  }
}
