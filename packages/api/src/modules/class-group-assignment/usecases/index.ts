import { Provider } from '@nestjs/common';
import {
  IFindClassesByGroupUseCase,
  IFindGroupsByClassUseCase,
} from '@pikslots/domain';
import { FindClassesByGroupUseCaseImpl } from './find.classes.by.group.usecase.impl';
import { FindGroupsByClassUseCaseImpl } from './find.groups.by.class.usecase.impl';

export const CLASS_GROUP_ASSIGNMENT_USECASES: Provider[] = [
  {
    useClass: FindClassesByGroupUseCaseImpl,
    provide: IFindClassesByGroupUseCase,
  },
  {
    useClass: FindGroupsByClassUseCaseImpl,
    provide: IFindGroupsByClassUseCase,
  },
];
