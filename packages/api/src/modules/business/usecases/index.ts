import {
  IFindAllRegisteredBusinessesUseCase,
  IRegisterBusinessUseCase,
} from '@pikslots/domain';
import { RegisterBusinessUseCaseImpl } from './register.business.usecase.impl';
import { Provider } from '@nestjs/common';
import { FindAllRegisteredBusinessesUseCaseImpl } from './find.all.registered.businesses.usecase.impl';

export const BUSINESS_USECASES: Provider[] = [
  {
    useClass: RegisterBusinessUseCaseImpl,
    provide: IRegisterBusinessUseCase,
  },

  {
    useClass: FindAllRegisteredBusinessesUseCaseImpl,
    provide: IFindAllRegisteredBusinessesUseCase,
  },
];
