import { Inject, Injectable } from '@nestjs/common';
import {
  IFindAllServicesByBusinessUseCase,
  IRegisterServiceUseCase,
} from '@pikslots/domain';
import type {
  FindAllServicesByBusinessUseCase,
  RegisterServiceUseCase,
} from '@pikslots/domain';

@Injectable()
export class ServiceUseCasesFactory {
  @Inject(IRegisterServiceUseCase)
  public readonly registerServiceUseCase: RegisterServiceUseCase;

  @Inject(IFindAllServicesByBusinessUseCase)
  public readonly findAllServicesByBusinessUsecase: FindAllServicesByBusinessUseCase;
}
