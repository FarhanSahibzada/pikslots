import { Inject, Injectable } from '@nestjs/common';
import {
  IFindAllServiceGroupsByBusinessUseCase,
  IRegisterServiceGroupUseCase,
  IDeleteServiceGroupUseCase,
  IEditServiceGroupUseCase,
} from '@pikslots/domain';
import type {
  FindAllServiceGroupsByBusinessUseCase,
  RegisterServiceGroupUseCase,
  DeleteServiceGroupUseCase,
  EditServiceGroupUseCase,
} from '@pikslots/domain';

@Injectable()
export class ServiceGroupUseCasesFactory {
  @Inject(IRegisterServiceGroupUseCase)
  public readonly registerServiceGroupUseCase: RegisterServiceGroupUseCase;

  @Inject(IFindAllServiceGroupsByBusinessUseCase)
  public readonly findAllServiceGroupsByBusinessUseCase: FindAllServiceGroupsByBusinessUseCase;

  @Inject(IDeleteServiceGroupUseCase)
  public readonly deleteServiceGroupUseCase: DeleteServiceGroupUseCase;

  @Inject(IEditServiceGroupUseCase)
  public readonly editServiceGroupUseCase: EditServiceGroupUseCase;
}
