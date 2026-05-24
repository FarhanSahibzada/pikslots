import { Inject, Injectable } from '@nestjs/common';
import {
  IFindUserByIdUseCase,
  IGetUserProfileUseCase,
  IInviteUserUseCase,
  ILoginUserUseCase,
  IRefreshUserSessionUseCase,
} from '@pikslots/domain';
import type {
  FindUserByIdUseCase,
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

  @Inject(ILoginUserUseCase)
  public readonly loginUserUseCase: LoginUserUseCase;

  @Inject(IRefreshUserSessionUseCase)
  public readonly refreshUserSessionUseCase: RefreshUserSessionUseCase;
}
