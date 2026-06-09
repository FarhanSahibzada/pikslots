import { Inject, Injectable } from '@nestjs/common';
import {
  IAssignServiceToGroupUseCase,
  IRemoveServiceFromGroupUseCase,
  IFindServicesByGroupUseCase,
} from '@pikslots/domain';
import type {
  AssignServiceToGroupUseCase,
  RemoveServiceFromGroupUseCase,
  FindServicesByGroupUseCase,
} from '@pikslots/domain';

@Injectable()
export class ServiceGroupAssignmentUseCasesFactory {
  @Inject(IAssignServiceToGroupUseCase)
  public readonly assignServiceToGroupUseCase: AssignServiceToGroupUseCase;

  @Inject(IRemoveServiceFromGroupUseCase)
  public readonly removeServiceFromGroupUseCase: RemoveServiceFromGroupUseCase;

  @Inject(IFindServicesByGroupUseCase)
  public readonly findServicesByGroupUseCase: FindServicesByGroupUseCase;
}
