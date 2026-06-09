import { Provider } from '@nestjs/common';
import {
  IAssignServiceToGroupUseCase,
  IRemoveServiceFromGroupUseCase,
  IFindServicesByGroupUseCase,
} from '@pikslots/domain';
import { AssignServiceToGroupUseCaseImpl } from './assign.service.to.group.usecase.impl';
import { RemoveServiceFromGroupUseCaseImpl } from './remove.service.from.group.usecase.impl';
import { FindServicesByGroupUseCaseImpl } from './find.services.by.group.usecase.impl';

export const SERVICE_GROUP_ASSIGNMENT_USECASES: Provider[] = [
  { useClass: AssignServiceToGroupUseCaseImpl, provide: IAssignServiceToGroupUseCase },
  { useClass: RemoveServiceFromGroupUseCaseImpl, provide: IRemoveServiceFromGroupUseCase },
  { useClass: FindServicesByGroupUseCaseImpl, provide: IFindServicesByGroupUseCase },
];
