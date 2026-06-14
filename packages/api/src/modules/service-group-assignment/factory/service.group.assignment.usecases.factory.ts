import { Inject, Injectable } from '@nestjs/common';
import {
  IFindServicesByGroupUseCase,
  IFindGroupsByServiceUseCase,
} from '@pikslots/domain';
import type {
  FindServicesByGroupUseCase,
  FindGroupsByServiceUseCase,
} from '@pikslots/domain';

@Injectable()
export class ServiceGroupAssignmentUseCasesFactory {
  @Inject(IFindServicesByGroupUseCase)
  public readonly findServicesByGroupUseCase: FindServicesByGroupUseCase;

  @Inject(IFindGroupsByServiceUseCase)
  public readonly findGroupsByServiceUseCase: FindGroupsByServiceUseCase;
}
