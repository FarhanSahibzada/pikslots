import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerUseCasesFactory } from './factory/customer.usecases.factory';
import { CUSTOMER_USECASES } from './usecases';
import { CustomerRepositoryImpl } from './repository/customer.repository.impl';
import { ICustomerRepository } from '@pikslots/domain';

@Module({
  imports: [],
  controllers: [CustomerController],
  providers: [
    CustomerUseCasesFactory,
    ...CUSTOMER_USECASES,
    { useClass: CustomerRepositoryImpl, provide: ICustomerRepository },
  ],
})
export class CustomerModule {}
