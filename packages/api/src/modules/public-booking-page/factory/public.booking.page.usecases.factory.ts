import { Inject, Injectable } from '@nestjs/common';
import {
  IFindBookingPageDetailsByBusinessSlugUseCase,
  IRegisterPublicBookingUseCase,
} from '@pikslots/domain';
import type {
  FindBookingPageDetailsByBusinessSlugUseCase,
  RegisterPublicBookingUseCase,
} from '@pikslots/domain';

@Injectable()
export class PublicBookingPageUseCaseFactory {
  @Inject(IFindBookingPageDetailsByBusinessSlugUseCase)
  public readonly findBookingPageDetailsByBusinessUseCase: FindBookingPageDetailsByBusinessSlugUseCase;

  @Inject(IRegisterPublicBookingUseCase)
  public readonly registerPublicBookingUseCase: RegisterPublicBookingUseCase;
}
