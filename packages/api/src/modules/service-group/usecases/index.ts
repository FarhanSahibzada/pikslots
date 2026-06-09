import { Provider } from '@nestjs/common';
import {
  ICreateServiceGroupUseCase,
  IFindAllServiceGroupsByBusinessUseCase,
} from '@pikslots/domain';
import { CreateServiceGroupUseCaseImpl } from './create.service.group.usecase.impl';
import { FindAllServiceGroupsByBusinessUseCaseImpl } from './find.all.service.groups.by.business.usecase.impl';

export const SERVICE_GROUP_USECASES: Provider[] = [
  {
    useClass: CreateServiceGroupUseCaseImpl,
    provide: ICreateServiceGroupUseCase,
  },
  {
    useClass: FindAllServiceGroupsByBusinessUseCaseImpl,
    provide: IFindAllServiceGroupsByBusinessUseCase,
  },
];
