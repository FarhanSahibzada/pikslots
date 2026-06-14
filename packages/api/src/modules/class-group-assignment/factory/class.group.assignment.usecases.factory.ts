import { Inject, Injectable } from '@nestjs/common';
import {
  IFindClassesByGroupUseCase,
  IFindGroupsByClassUseCase,
} from '@pikslots/domain';
import type {
  FindClassesByGroupUseCase,
  FindGroupsByClassUseCase,
} from '@pikslots/domain';

@Injectable()
export class ClassGroupAssignmentUseCasesFactory {
  @Inject(IFindClassesByGroupUseCase)
  public readonly findClassesByGroupUseCase: FindClassesByGroupUseCase;

  @Inject(IFindGroupsByClassUseCase)
  public readonly findGroupsByClassUseCase: FindGroupsByClassUseCase;
}
