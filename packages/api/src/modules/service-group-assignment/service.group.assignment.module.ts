import { Module } from '@nestjs/common';
import { ServiceGroupAssignmentController } from './service.group.assignment.controller';
import { ServiceGroupAssignmentUseCasesFactory } from './factory/service.group.assignment.usecases.factory';
import { SERVICE_GROUP_ASSIGNMENT_USECASES } from './usecases';
import { ServiceGroupAssignmentRepositoryImpl } from './repository/service.group.assignment.repository.impl';
import { IServiceGroupAssignmentRepository } from '@pikslots/domain';

@Module({
  controllers: [ServiceGroupAssignmentController],
  providers: [
    ServiceGroupAssignmentUseCasesFactory,
    ...SERVICE_GROUP_ASSIGNMENT_USECASES,
    { useClass: ServiceGroupAssignmentRepositoryImpl, provide: IServiceGroupAssignmentRepository },
  ],
})
export class ServiceGroupAssignmentModule {}
