import { Provider } from '@nestjs/common';
import {
  IFindAllServiceGroupsByBusinessUseCase,
  IRegisterServiceGroupUseCase,
  IDeleteServiceGroupUseCase,
  IEditServiceGroupUseCase,
} from '@pikslots/domain';
import { RegisterServiceGroupUseCaseImpl } from './register.service.group.usecase.impl';
import { FindAllServiceGroupsByBusinessUseCaseImpl } from './find.all.service.groups.by.business.usecase.impl';
import { DeleteServiceGroupUseCaseImpl } from './delete.service.group.usecase.impl';
import { EditServiceGroupUseCaseImpl } from './edit.service.group.usecase.impl';

export const SERVICE_GROUP_USECASES: Provider[] = [
  {
    useClass: RegisterServiceGroupUseCaseImpl,
    provide: IRegisterServiceGroupUseCase,
  },
  {
    useClass: FindAllServiceGroupsByBusinessUseCaseImpl,
    provide: IFindAllServiceGroupsByBusinessUseCase,
  },
  {
    useClass: DeleteServiceGroupUseCaseImpl,
    provide: IDeleteServiceGroupUseCase,
  },
  {
    useClass: EditServiceGroupUseCaseImpl,
    provide: IEditServiceGroupUseCase,
  },
];
