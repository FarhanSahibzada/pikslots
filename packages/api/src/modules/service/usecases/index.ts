import { Provider } from '@nestjs/common';
import {
  IFindAllServicesByBusinessUseCase,
  IRegisterServiceUseCase,
} from '@pikslots/domain';
import { RegisterServiceUseCaseImpl } from './register.service.usecase.impl';
import { FindAllServicesByBusinessUseCaseImpl } from './find.all.services.by.business.usecase.impl';

export const SERVICE_USECASES: Provider[] = [
  { useClass: RegisterServiceUseCaseImpl, provide: IRegisterServiceUseCase },
  {
    useClass: FindAllServicesByBusinessUseCaseImpl,
    provide: IFindAllServicesByBusinessUseCase,
  },
];
