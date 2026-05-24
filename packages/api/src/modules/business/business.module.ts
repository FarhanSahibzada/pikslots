import { Module } from '@nestjs/common';
import { IBusinessRepository } from '@pikslots/domain';
import { BUSINESS_USECASES } from './usecases';
import { BusinessUseCaseFactory } from './factroy/business.usecases.factory';
import { BusinessController } from './business.controller';
// import { BusinessRepositoryImpl } from './repositroy/business.repository.impl';

@Module({
  providers: [
    // { useClass: BusinessRepositoryImpl, provide: IBusinessRepository },
    ...BUSINESS_USECASES,
    BusinessUseCaseFactory,
  ],
  controllers: [BusinessController],
})
export class BusinessModule {}
