import { Module } from '@nestjs/common';
import { BookingUseCasesFactory } from './factory/booking.usecases.factory';
import { BOOKING_USECASES } from './usecases';
import { BookingRepositoryImpl } from './repository/booking.repository.impl';
import { IBookingRepository } from '@pikslots/domain';
import { BookingController } from './booking.controller';

@Module({
  imports: [],
  controllers: [BookingController],
  providers: [
    BookingUseCasesFactory,
    ...BOOKING_USECASES,
    { useClass: BookingRepositoryImpl, provide: IBookingRepository },
  ],
})
export class BookingModule {}
