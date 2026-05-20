import { Inject, Injectable } from '@nestjs/common';
import {
  IFindAllRegisteredBusinessesUseCase,
  IRegisterBusinessUseCase,
} from '@pikslots/domain';
import type {
  FindAllRegisteredBusinessesUseCase,
  RegisterBusinessUseCase,
} from '@pikslots/domain';

@Injectable()
export class BusinessUseCaseFactory {
  @Inject(IRegisterBusinessUseCase)
  public readonly registerBusinessUseCase: RegisterBusinessUseCase;

  @Inject(IFindAllRegisteredBusinessesUseCase)
  public readonly findAllRegisteredBusinessesUseCase: FindAllRegisteredBusinessesUseCase;
}
