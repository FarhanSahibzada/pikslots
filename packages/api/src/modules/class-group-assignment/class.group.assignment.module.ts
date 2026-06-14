import { Module } from '@nestjs/common';
import { IClassGroupAssignmentRepository } from '@pikslots/domain';
import { ClassGroupAssignmentController } from './class.group.assignment.controller';
import { ClassGroupAssignmentUseCasesFactory } from './factory/class.group.assignment.usecases.factory';
import { CLASS_GROUP_ASSIGNMENT_USECASES } from './usecases';
import { CLASS_GROUP_ASSIGNMENT_EVENTS } from './events';
import { ClassGroupAssignmentRepositoryImpl } from './repository/class.group.assignment.repository.impl';

@Module({
  controllers: [ClassGroupAssignmentController],
  providers: [
    ClassGroupAssignmentUseCasesFactory,
    ...CLASS_GROUP_ASSIGNMENT_USECASES,
    ...CLASS_GROUP_ASSIGNMENT_EVENTS,
    {
      useClass: ClassGroupAssignmentRepositoryImpl,
      provide: IClassGroupAssignmentRepository,
    },
  ],
})
export class ClassGroupAssignmentModule {}
