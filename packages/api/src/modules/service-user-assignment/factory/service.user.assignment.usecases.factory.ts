import { Inject, Injectable } from '@nestjs/common';
import {
  IRemoveUserFromServiceUseCase,
  IFindUsersByServiceUseCase,
  IFindServicesByUserUseCase,
} from '@pikslots/domain';
import type {
  RemoveUserFromServiceUseCase,
  FindUsersByServiceUseCase,
  FindServicesByUserUseCase,
} from '@pikslots/domain';

@Injectable()
export class ServiceUserAssignmentUseCasesFactory {
  @Inject(IRemoveUserFromServiceUseCase)
  public readonly removeUserFromServiceUseCase: RemoveUserFromServiceUseCase;

  @Inject(IFindUsersByServiceUseCase)
  public readonly findUsersByServiceUseCase: FindUsersByServiceUseCase;

  @Inject(IFindServicesByUserUseCase)
  public readonly findServicesByUserUseCase: FindServicesByUserUseCase;
}
