import { Module } from '@nestjs/common';
import { ServiceGroupController } from './service.group.controller';
import { ServiceGroupUseCasesFactory } from './factory/service.group.usecases.factory';
import { SERVICE_GROUP_USECASES } from './usecases';
import { ServiceGroupRepositoryImpl } from './repository/service.group.repository.impl';
import { IServiceGroupRepository } from '@pikslots/domain';

@Module({
  controllers: [ServiceGroupController],
  providers: [
    ServiceGroupUseCasesFactory,
    ...SERVICE_GROUP_USECASES,
    { useClass: ServiceGroupRepositoryImpl, provide: IServiceGroupRepository },
  ],
})
export class ServiceGroupModule {}
