import { Inject, Injectable } from '@nestjs/common';
import {
  ICreateServiceGroupUseCase,
  IFindAllServiceGroupsByBusinessUseCase,
} from '@pikslots/domain';
import type {
  CreateServiceGroupUseCase,
  FindAllServiceGroupsByBusinessUseCase,
} from '@pikslots/domain';

@Injectable()
export class ServiceGroupUseCasesFactory {
  @Inject(ICreateServiceGroupUseCase)
  public readonly createServiceGroupUseCase: CreateServiceGroupUseCase;

  @Inject(IFindAllServiceGroupsByBusinessUseCase)
  public readonly findAllServiceGroupsByBusinessUseCase: FindAllServiceGroupsByBusinessUseCase;
}
