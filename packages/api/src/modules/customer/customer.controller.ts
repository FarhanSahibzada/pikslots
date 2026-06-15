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
import { mapCustomerError } from './errors/customer.errors.map';
import { CUSTOMER_ENDPOINTS } from '@pikslots/shared';
import { RegisterCustomerDto } from './dto/register.customer.dto';
import { EditCustomerDto } from './dto/edit.customer.dto';
import {
  RegisterCustomerDocs,
  EditCustomerDocs,
  DeleteCustomerDocs,
  FindAllCustomersByBusinessDocs,
} from './docs/customer.controller.docs';
import { CustomerUseCasesFactory } from './factory/customer.usecases.factory';
import type {
  RegisterCustomerResponse,
  FindAllCustomersByBusinessResponse,
  EditCustomerResponse,
  DeleteCustomerResponse,
} from '@pikslots/shared';

@ApiTags('Customers')
@Controller('')
export class CustomerController {
  constructor(
    private readonly customerUseCasesFactory: CustomerUseCasesFactory,
    private readonly securityContext: SecurityContext,
  ) {}

  @RegisterCustomerDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Enhanced', 'Standard')
  @Post(CUSTOMER_ENDPOINTS.REGISTER)
  async registerCustomer(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: RegisterCustomerDto,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<RegisterCustomerResponse>
  > {
    const result =
      await this.customerUseCasesFactory.registerCustomerUseCase.execute({
        name: { firstName: dto.firstName, lastName: dto.lastName },
        profileImageUrl: dto.profileImageUrl,
        email: dto.email,
        additionalEmail: dto.additionalEmail,
        primaryPhone: dto.primaryPhone,
        additionalPhone: dto.additionalPhone,
        company: dto.company,
        country: dto.country,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        zipCode: dto.zipCode,
        notes: dto.notes,
        customerSocialLinks: dto.customerSocialLinks,
        businessId: dto.businessId,
        createdBy: this.securityContext.userId,
      });

    if (!result.ok) {
      const errorResponse = mapCustomerError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.CREATED);
    return new PikslotsBaseResponse<RegisterCustomerResponse>(
      { message: 'success' },
      HttpStatus.CREATED,
    );
  }

  @EditCustomerDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Enhanced', 'Standard')
  @Patch(CUSTOMER_ENDPOINTS.EDIT)
  async editCustomer(
    @Res({ passthrough: true }) res: Response,
    @Param('customerId') customerId: string,
    @Body() dto: EditCustomerDto,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<EditCustomerResponse>
  > {
    const result =
      await this.customerUseCasesFactory.editCustomerUseCase.execute({
        id: customerId,
        name: { firstName: dto.firstName, lastName: dto.lastName },
        profileImageUrl: dto.profileImageUrl,
        email: dto.email,
        additionalEmail: dto.additionalEmail,
        primaryPhone: dto.primaryPhone,
        additionalPhone: dto.additionalPhone,
        company: dto.company,
        country: dto.country,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        zipCode: dto.zipCode,
        notes: dto.notes,
        customerSocialLinks: dto.customerSocialLinks,
        businessId: dto.businessId,
        updatedBy: this.securityContext.userId,
      });

    if (!result.ok) {
      const errorResponse = mapCustomerError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<EditCustomerResponse>(
      { message: 'success' },
      HttpStatus.OK,
    );
  }

  @DeleteCustomerDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Delete(CUSTOMER_ENDPOINTS.DELETE)
  async deleteCustomer(
    @Res({ passthrough: true }) res: Response,
    @Param('customerId') customerId: string,
    @Body('businessId') businessId: string,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<DeleteCustomerResponse>
  > {
    const result =
      await this.customerUseCasesFactory.deleteCustomerUseCase.execute({
        id: customerId,
        businessId,
        deletedBy: this.securityContext.userId,
      });

    if (!result.ok) {
      const errorResponse = mapCustomerError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<DeleteCustomerResponse>(
      { message: 'success' },
      HttpStatus.OK,
    );
  }

  @FindAllCustomersByBusinessDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Enhanced', 'Standard')
  @Get(CUSTOMER_ENDPOINTS.FIND_ALL_BY_BUSINESS)
  async findAllByBusiness(
    @Res({ passthrough: true }) res: Response,
    @Param('businessId') businessId: string,
  ): Promise<
    | PikslotsBaseErrorResponse
    | PikslotsBaseResponse<FindAllCustomersByBusinessResponse>
  > {
    const result =
      await this.customerUseCasesFactory.findAllCustomersByBusinessUseCase.execute(
        businessId,
      );

    if (!result.ok) {
      const errorResponse = mapCustomerError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<FindAllCustomersByBusinessResponse>(
      result.value.map((c) => ({
        id: c.id,
        firstName: c.name.firstName,
        lastName: c.name.lastName,
        profileImageUrl: c.profileImageUrl,
        email: c.email,
        additionalEmail: c.additionalEmail,
        primaryPhone: c.primaryPhone,
        additionalPhone: c.additionalPhone,
        company: c.company,
        country: c.country,
        address: c.address,
        city: c.city,
        state: c.state,
        zipCode: c.zipCode,
        notes: c.notes,
        customerSocialLinks: c.customerSocialLinks,
        businessId: c.businessId,
      })),
      HttpStatus.OK,
    );
  }
}
