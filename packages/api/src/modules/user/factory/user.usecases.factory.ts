import { Inject, Injectable } from '@nestjs/common';
import {
  IFindUserByIdUseCase,
  IGetAllBusinessOwnersUseCase,
  IGetAllUsersByRole,
  IGetUserProfileUseCase,
  IInviteUserUseCase,
  ILoginUserUseCase,
  IRefreshUserSessionUseCase,
} from '@pikslots/domain';
import type {
  FindUserByIdUseCase,
  GetAllBusinessOwnersUseCase,
  GetAllUsersByRoleUseCase,
  GetUserProfileUseCase,
  InviteUserUseCase,
  LoginUserUseCase,
  RefreshUserSessionUseCase,
} from '@pikslots/domain';

@Injectable()
export class UserUsecasesFactory {
  @Inject(IInviteUserUseCase)
  public readonly inviteUserUseCase: InviteUserUseCase;

  @Inject(IFindUserByIdUseCase)
  public readonly findUserByIdUseCase: FindUserByIdUseCase;

  @Inject(IGetUserProfileUseCase)
  public readonly getUserProfileUseCase: GetUserProfileUseCase;

  @Inject(IGetAllBusinessOwnersUseCase)
  public readonly getAllBusinessOwnersUseCase: GetAllBusinessOwnersUseCase;

  @Inject(IGetAllUsersByRole)
  public readonly getAllUsersByRoleUseCase: GetAllUsersByRoleUseCase;

  @Inject(ILoginUserUseCase)
  public readonly loginUserUseCase: LoginUserUseCase;

  @Inject(IRefreshUserSessionUseCase)
  public readonly refreshUserSessionUseCase: RefreshUserSessionUseCase;
}
