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
import { RolesGuard } from 'src/shared/security/guards/roles.guard';
import { Roles } from 'src/shared/security/guards/roles.decorator';
import { CLASS_GROUP_ASSIGNMENT_ENDPOINTS } from '@pikslots/shared';
import { mapClassGroupAssignmentError } from './errors/class.group.assignment.errors.map';
import {
  FindClassesByGroupDocs,
  FindGroupsByClassDocs,
} from './docs/class.group.assignment.controller.docs';
import { ClassGroupAssignmentUseCasesFactory } from './factory/class.group.assignment.usecases.factory';
import type {
  ClassGroupNameResponse,
  ClassNameResponse,
  FindClassesByGroupResponse,
} from '@pikslots/shared';

@ApiTags('Class Group Assignments')
@Controller('')
export class ClassGroupAssignmentController {
  constructor(
    private readonly useCasesFactory: ClassGroupAssignmentUseCasesFactory,
  ) {}

  @FindGroupsByClassDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Standard', 'Enhanced')
  @Get(CLASS_GROUP_ASSIGNMENT_ENDPOINTS.FIND_GROUPS_BY_CLASS)
  async findGroupsByClass(
    @Res({ passthrough: true }) res: Response,
    @Param('classId') classId: string,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<ClassGroupNameResponse[]>
  > {
    const result =
      await this.useCasesFactory.findGroupsByClassUseCase.execute(classId);

    if (!result.ok) {
      const errorResponse = mapClassGroupAssignmentError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<ClassGroupNameResponse[]>(
      result.value,
      HttpStatus.OK,
    );
  }

  @FindClassesByGroupDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Standard', 'Enhanced')
  @Get(CLASS_GROUP_ASSIGNMENT_ENDPOINTS.FIND_BY_GROUP)
  async findClassesByGroup(
    @Res({ passthrough: true }) res: Response,
    @Param('classGroupId') classGroupId: string,
  ): Promise<
    | PikslotsBaseErrorResponse
    | PikslotsBaseResponse<FindClassesByGroupResponse>
  > {
    const result =
      await this.useCasesFactory.findClassesByGroupUseCase.execute(
        classGroupId,
      );

    if (!result.ok) {
      const errorResponse = mapClassGroupAssignmentError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<ClassNameResponse[]>(
      result.value.map((c) => ({ id: c.id, name: c.title })),
      HttpStatus.OK,
    );
  }
}
