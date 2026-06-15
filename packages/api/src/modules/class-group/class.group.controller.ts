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
import { mapClassGroupError } from './errors/class.group.errors.map';
import { CLASS_GROUP_ENDPOINTS } from '@pikslots/shared';
import { RegisterClassGroupDto } from './dto/create.class.group.dto';
import { EditClassGroupDto } from './dto/edit.class.group.dto';
import {
  CreateClassGroupDocs,
  DeleteClassGroupDocs,
  EditClassGroupDocs,
  FindAllClassGroupsByBusinessDocs,
} from './docs/class.group.controller.docs';
import { ClassGroupUseCasesFactory } from './factory/class.group.usecases.factory';
import type {
  ClassGroupResponse,
  RegisterClassGroupResponse,
} from '@pikslots/shared';

@ApiTags('Class Groups')
@Controller('')
export class ClassGroupController {
  constructor(
    private readonly classGroupUseCasesFactory: ClassGroupUseCasesFactory,
    private readonly securityContext: SecurityContext,
  ) {}

  @CreateClassGroupDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Post(CLASS_GROUP_ENDPOINTS.REGISTER)
  async registerClassGroup(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: RegisterClassGroupDto,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<RegisterClassGroupResponse>
  > {
    const result =
      await this.classGroupUseCasesFactory.registerClassGroupUseCase.execute({
        name: dto.name,
        businessId: dto.businessId,
        associatedClasses: dto.associatedClasses,
        createdBy: this.securityContext.userId,
      });

    if (!result.ok) {
      const errorResponse = mapClassGroupError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.CREATED);
    return new PikslotsBaseResponse<RegisterClassGroupResponse>(
      result.value,
      HttpStatus.CREATED,
    );
  }

  @EditClassGroupDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Patch(CLASS_GROUP_ENDPOINTS.EDIT)
  async editClassGroup(
    @Res({ passthrough: true }) res: Response,
    @Param('classGroupId') classGroupId: string,
    @Body() dto: EditClassGroupDto,
  ): Promise<PikslotsBaseErrorResponse | PikslotsBaseResponse<void>> {
    const result =
      await this.classGroupUseCasesFactory.editClassGroupUseCase.execute({
        classGroupId,
        name: dto.name,
        businessId: dto.businessId,
        classIds: dto.classIds,
        updatedBy: this.securityContext.userId,
      });

    if (!result.ok) {
      const errorResponse = mapClassGroupError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<void>(undefined, HttpStatus.OK);
  }

  @DeleteClassGroupDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Delete(CLASS_GROUP_ENDPOINTS.DELETE)
  async deleteClassGroup(
    @Res({ passthrough: true }) res: Response,
    @Param('classGroupId') classGroupId: string,
  ): Promise<PikslotsBaseErrorResponse | PikslotsBaseResponse<void>> {
    const result =
      await this.classGroupUseCasesFactory.deleteClassGroupUseCase.execute(
        classGroupId,
      );

    if (!result.ok) {
      const errorResponse = mapClassGroupError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<void>(undefined, HttpStatus.OK);
  }

  @FindAllClassGroupsByBusinessDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Enhanced', 'Standard')
  @Get(CLASS_GROUP_ENDPOINTS.FIND_ALL_BY_BUSINESS)
  async findAllByBusiness(
    @Res({ passthrough: true }) res: Response,
    @Param('businessId') businessId: string,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<ClassGroupResponse[]>
  > {
    const result =
      await this.classGroupUseCasesFactory.findAllClassGroupsByBusinessUseCase.execute(
        businessId,
      );

    if (!result.ok) {
      const errorResponse = mapClassGroupError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<ClassGroupResponse[]>(
      result.value.map((g) => ({
        id: g.id,
        name: g.name,
        businessId: g.businessId,
      })),
      HttpStatus.OK,
    );
  }
}
