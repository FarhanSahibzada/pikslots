import { Inject, Injectable } from '@nestjs/common';
import {
  IDeleteClassGroupUseCase,
  IEditClassGroupUseCase,
  IFindAllClassGroupsByBusinessUseCase,
  IRegisterClassGroupUseCase,
} from '@pikslots/domain';
import type {
  DeleteClassGroupUseCase,
  EditClassGroupUseCase,
  FindAllClassGroupsByBusinessUseCase,
  RegisterClassGroupUseCase,
} from '@pikslots/domain';

@Injectable()
export class ClassGroupUseCasesFactory {
  @Inject(IRegisterClassGroupUseCase)
  public readonly registerClassGroupUseCase: RegisterClassGroupUseCase;

  @Inject(IFindAllClassGroupsByBusinessUseCase)
  public readonly findAllClassGroupsByBusinessUseCase: FindAllClassGroupsByBusinessUseCase;

  @Inject(IDeleteClassGroupUseCase)
  public readonly deleteClassGroupUseCase: DeleteClassGroupUseCase;

  @Inject(IEditClassGroupUseCase)
  public readonly editClassGroupUseCase: EditClassGroupUseCase;
}
