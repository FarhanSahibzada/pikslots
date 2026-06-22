import { Inject, Injectable } from '@nestjs/common';
import {
  IDeleteBookingUseCase,
  IFindAllBookingsByBusinessUseCase,
  IFindBookingByIdUseCase,
  IRegisterBookingUseCase,
} from '@pikslots/domain';
import type {
  DeleteBookingUseCase,
  FindAllBookingsByBusinessUseCase,
  FindBookingByIdUseCase,
  RegisterBookingUseCase,
} from '@pikslots/domain';

@Injectable()
export class BookingUseCasesFactory {
  @Inject(IRegisterBookingUseCase)
  public readonly registerBookingUseCase: RegisterBookingUseCase;

  @Inject(IFindAllBookingsByBusinessUseCase)
  public readonly findAllBookingsByBusinessUseCase: FindAllBookingsByBusinessUseCase;

  @Inject(IFindBookingByIdUseCase)
  public readonly findBookingByIdUseCase: FindBookingByIdUseCase;

  @Inject(IDeleteBookingUseCase)
  public readonly deleteBookingUseCase: DeleteBookingUseCase;
}
