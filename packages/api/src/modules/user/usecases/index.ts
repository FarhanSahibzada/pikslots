import { Provider } from '@nestjs/common';
import { InviteUserUsecaseImpl } from './invite.user.usecase.impl';
import { FindUserByIdUseCaseImpl } from './find.user.by.id.usecase.impl';
import { GetUserProfileUseCaseImpl } from './get.user.profile.usecase.impl';
import { GetAllBusinessOwnersUseCaseImpl } from './get.all.business.owners.usecase.impl';
import { GetAllUsersByRoleUseCaseImpl } from './get.all.users.by.role.usecase.impl';
import {
  IFindUserByIdUseCase,
  IGetAllBusinessOwnersUseCase,
  IGetAllUsersByRole,
  IGetUserProfileUseCase,
  IInviteUserUseCase,
  ILoginUserUseCase,
  IRefreshUserSessionUseCase,
} from '@pikslots/domain';
import { LoginUserUseCaseImpl } from './login.user.usecase.impl';
import { RefreshUserSessionUseCaseImpl } from './refresh.user.session.usecase.impl';

export const USER_USECASES: Provider[] = [
  { useClass: InviteUserUsecaseImpl, provide: IInviteUserUseCase },
  { useClass: FindUserByIdUseCaseImpl, provide: IFindUserByIdUseCase },
  { useClass: GetUserProfileUseCaseImpl, provide: IGetUserProfileUseCase },
  { useClass: GetAllBusinessOwnersUseCaseImpl, provide: IGetAllBusinessOwnersUseCase },
  { useClass: GetAllUsersByRoleUseCaseImpl, provide: IGetAllUsersByRole },
  { useClass: LoginUserUseCaseImpl, provide: ILoginUserUseCase },
  {
    useClass: RefreshUserSessionUseCaseImpl,
    provide: IRefreshUserSessionUseCase,
  },
];
