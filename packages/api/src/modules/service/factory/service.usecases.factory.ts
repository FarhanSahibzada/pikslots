import { Inject, Injectable } from '@nestjs/common';
import {
  IFindAllServicesByBusinessUseCase,
  IRegisterServiceUseCase,
  IEditServiceUseCase,
  IDeleteServiceUseCase,
} from '@pikslots/domain';
import type {
  FindAllServicesByBusinessUseCase,
  RegisterServiceUseCase,
  EditServiceUseCase,
  DeleteServiceUseCase,
} from '@pikslots/domain';

@Injectable()
export class ServiceUseCasesFactory {
  @Inject(IRegisterServiceUseCase)
  public readonly registerServiceUseCase: RegisterServiceUseCase;

  @Inject(IFindAllServicesByBusinessUseCase)
  public readonly findAllServicesByBusinessUsecase: FindAllServicesByBusinessUseCase;

  @Inject(IEditServiceUseCase)
  public readonly editServiceUseCase: EditServiceUseCase;

  @Inject(IDeleteServiceUseCase)
  public readonly deleteServiceUseCase: DeleteServiceUseCase;
}
