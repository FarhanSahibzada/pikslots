import { Provider } from '@nestjs/common';
import {
  IDeleteClassGroupUseCase,
  IEditClassGroupUseCase,
  IFindAllClassGroupsByBusinessUseCase,
  IRegisterClassGroupUseCase,
} from '@pikslots/domain';
import { RegisterClassGroupUseCaseImpl } from './register.class.group.usecase.impl';
import { FindAllClassGroupsByBusinessUseCaseImpl } from './find.all.class.groups.by.business.usecase.impl';
import { DeleteClassGroupUseCaseImpl } from './delete.class.group.usecase.impl';
import { EditClassGroupUseCaseImpl } from './edit.class.group.usecase.impl';

export const CLASS_GROUP_USECASES: Provider[] = [
  {
    useClass: RegisterClassGroupUseCaseImpl,
    provide: IRegisterClassGroupUseCase,
  },
  {
    useClass: FindAllClassGroupsByBusinessUseCaseImpl,
    provide: IFindAllClassGroupsByBusinessUseCase,
  },
  {
    useClass: DeleteClassGroupUseCaseImpl,
    provide: IDeleteClassGroupUseCase,
  },
  {
    useClass: EditClassGroupUseCaseImpl,
    provide: IEditClassGroupUseCase,
  },
];
