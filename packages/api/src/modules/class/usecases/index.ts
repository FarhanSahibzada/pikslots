import { Provider } from '@nestjs/common';
import {
  IDeleteClassUseCase,
  IEditClassUseCase,
  IFindAllClassesByBusinessUseCase,
  IRegisterClassUseCase,
} from '@pikslots/domain';
import { DeleteClassUseCaseImpl } from './delete.class.usecase.impl';
import { EditClassUseCaseImpl } from './edit.class.usecase.impl';
import { FindAllClassesByBusinessUseCaseImpl } from './find.all.classes.by.business.usecase.impl';
import { RegisterClassUseCaseImpl } from './register.class.usecase.impl';

export const CLASS_USECASES: Provider[] = [
  { useClass: RegisterClassUseCaseImpl, provide: IRegisterClassUseCase },
  {
    useClass: FindAllClassesByBusinessUseCaseImpl,
    provide: IFindAllClassesByBusinessUseCase,
  },
  { useClass: EditClassUseCaseImpl, provide: IEditClassUseCase },
  { useClass: DeleteClassUseCaseImpl, provide: IDeleteClassUseCase },
];
