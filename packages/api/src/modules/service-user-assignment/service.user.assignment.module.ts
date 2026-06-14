import { Module } from '@nestjs/common';
import { ServiceUserAssignmentController } from './service.user.assignment.controller';
import { ServiceUserAssignmentUseCasesFactory } from './factory/service.user.assignment.usecases.factory';
import { SERVICE_USER_ASSIGNMENT_USECASES } from './usecases';
import { ServiceUserAssignmentRepositoryImpl } from './repository/service.user.assignment.repository.impl';
import { IServiceUserAssignmentRepository } from '@pikslots/domain';
import { SERVICE_USER_ASSIGNMENT_EVENTS } from './events';

@Module({
  controllers: [ServiceUserAssignmentController],
  providers: [
    ServiceUserAssignmentUseCasesFactory,
    ...SERVICE_USER_ASSIGNMENT_USECASES,
    ...SERVICE_USER_ASSIGNMENT_EVENTS,
    {
      useClass: ServiceUserAssignmentRepositoryImpl,
      provide: IServiceUserAssignmentRepository,
    },
  ],
})
export class ServiceUserAssignmentModule {}
