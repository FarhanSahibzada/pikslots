import { Provider } from '@nestjs/common';
import {
  IFindAllBookingsByBusinessUseCase,
  IFindBookingByIdUseCase,
  IDeleteBookingUseCase,
  IRegisterBookingUseCase,
} from '@pikslots/domain';
import { FindAllBookingsByBusinessUseCaseImpl } from './find.all.bookings.by.business.usecase.impl';
import { FindBookingByIdUseCaseImpl } from './find.booking.by.id.usecase.impl';
import { DeleteBookingUseCaseImpl } from './delete.booking.usecase.impl';
import { RegisterBookingUseCaseImpl } from './register.booking.usecase.impl';

export const BOOKING_USECASES: Provider[] = [
  { useClass: RegisterBookingUseCaseImpl, provide: IRegisterBookingUseCase },
  {
    useClass: FindAllBookingsByBusinessUseCaseImpl,
    provide: IFindAllBookingsByBusinessUseCase,
  },
  { useClass: FindBookingByIdUseCaseImpl, provide: IFindBookingByIdUseCase },
  { useClass: DeleteBookingUseCaseImpl, provide: IDeleteBookingUseCase },
];
