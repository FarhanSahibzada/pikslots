import { Module } from '@nestjs/common';
import { BookingUseCasesFactory } from './factory/booking.usecases.factory';
import { BOOKING_USECASES } from './usecases';
import { BookingRepositoryImpl } from './repository/booking.repository.impl';
import { IBookingRepository } from '@pikslots/domain';
import { BookingController } from './booking.controller';
import { BusinessModule } from '../business/business.module';
import { CustomerModule } from '../customer/customer.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [BusinessModule, CustomerModule, UserModule],
  controllers: [BookingController],
  providers: [
    BookingUseCasesFactory,
    ...BOOKING_USECASES,
    { useClass: BookingRepositoryImpl, provide: IBookingRepository },
  ],
  exports: [IBookingRepository],
})
export class BookingModule {}
