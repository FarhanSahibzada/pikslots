import { Module } from '@nestjs/common';
import { IClassGroupRepository } from '@pikslots/domain';
import { ClassGroupController } from './class.group.controller';
import { ClassGroupUseCasesFactory } from './factory/class.group.usecases.factory';
import { CLASS_GROUP_USECASES } from './usecases';
import { ClassGroupRepositoryImpl } from './repository/class.group.repository.impl';

@Module({
  controllers: [ClassGroupController],
  providers: [
    ClassGroupUseCasesFactory,
    ...CLASS_GROUP_USECASES,
    { useClass: ClassGroupRepositoryImpl, provide: IClassGroupRepository },
  ],
})
export class ClassGroupModule {}
