import {
  Body,
  Controller,
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
import { mapServiceError } from './errors/service.errors.map';
import { SERVICE_ENDPOINTS } from '@pikslots/shared';
import { RegisterServiceDto } from './dto/register.service.dto';
import { RegisterServiceDocs, FindAllServicesByBusinessDocs } from './docs/service.controller.docs';
import { ServiceUseCasesFactory } from './factory/service.usecases.factory';
import {
  RegisterServiceResponse,
  FindAllServicesByBusinessResponse,
} from '@pikslots/shared';

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
        businessId: this.securityContext.businessId!,
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

  @FindAllServicesByBusinessDocs()
  @Get(SERVICE_ENDPOINTS.FIND_ALL_BY_BUSINESS)
  async findAllByBusiness(
    @Res({ passthrough: true }) res: Response,
    @Param('businessId') businessId: string,
  ): Promise<PikslotsBaseErrorResponse | PikslotsBaseResponse<FindAllServicesByBusinessResponse>> {
    const result =
      await this.serviceUseCasesFactory.findAllServicesByBusinessUsecase.execute(businessId);

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
