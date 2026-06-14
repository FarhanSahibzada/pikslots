import { Inject, Injectable } from '@nestjs/common';
import {
  IDeleteClassUseCase,
  IEditClassUseCase,
  IFindAllClassesByBusinessUseCase,
  IRegisterClassUseCase,
} from '@pikslots/domain';
import type {
  DeleteClassUseCase,
  EditClassUseCase,
  FindAllClassesByBusinessUseCase,
  RegisterClassUseCase,
} from '@pikslots/domain';

@Injectable()
export class ClassUseCasesFactory {
  @Inject(IRegisterClassUseCase)
  public readonly registerClassUseCase: RegisterClassUseCase;

  @Inject(IFindAllClassesByBusinessUseCase)
  public readonly findAllClassesByBusinessUseCase: FindAllClassesByBusinessUseCase;

  @Inject(IEditClassUseCase)
  public readonly editClassUseCase: EditClassUseCase;

  @Inject(IDeleteClassUseCase)
  public readonly deleteClassUseCase: DeleteClassUseCase;
}
