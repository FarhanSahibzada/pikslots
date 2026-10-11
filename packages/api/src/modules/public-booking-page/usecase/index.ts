import { Provider } from '@nestjs/common';
import {
  IFindBookingPageDetailsByBusinessSlugUseCase,
  IRegisterPublicBookingUseCase,
} from '@pikslots/domain';
import { FindBookingPageDetailsByBusinessSlugUseCaseImpl } from './find.booking.page.details.by.business.slug.usecase.impl';
import { RegisterPublicBookingUseCaseImpl } from './register.public.booking.usecase.impl';

export const PUBLIC_BOOKING_PAGE_USECASES: Provider[] = [
  {
    useClass: FindBookingPageDetailsByBusinessSlugUseCaseImpl,
    provide: IFindBookingPageDetailsByBusinessSlugUseCase,
  },
  {
    useClass: RegisterPublicBookingUseCaseImpl,
    provide: IRegisterPublicBookingUseCase,
  },
];
