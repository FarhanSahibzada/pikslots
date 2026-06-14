import { Provider } from '@nestjs/common';
import {
  IFindServicesByGroupUseCase,
  IFindGroupsByServiceUseCase,
} from '@pikslots/domain';
import { FindServicesByGroupUseCaseImpl } from './find.services.by.group.usecase.impl';
import { FindGroupsByServiceUseCaseImpl } from './find.groups.by.service.usecase.impl';

export const SERVICE_GROUP_ASSIGNMENT_USECASES: Provider[] = [
  { useClass: FindServicesByGroupUseCaseImpl, provide: IFindServicesByGroupUseCase },
  { useClass: FindGroupsByServiceUseCaseImpl, provide: IFindGroupsByServiceUseCase },
];
