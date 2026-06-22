import { Controller, Delete, HttpStatus, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { PikslotsBaseResponse } from 'src/shared/types/base.response';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { RolesGuard } from 'src/shared/security/guards/roles.guard';
import { Roles } from 'src/shared/security/guards/roles.decorator';
import { mapBookingError } from './errors/booking.errors.map';
import { BOOKING_ENDPOINTS } from '@pikslots/shared';
import { DeleteBookingDocs } from './docs/booking.controller.docs';
import { BookingUseCasesFactory } from './factory/booking.usecases.factory';
import type { DeleteBookingResponse } from '@pikslots/shared';

@ApiTags('Bookings')
@Controller('')
export class BookingController {
  constructor(
    private readonly bookingUseCasesFactory: BookingUseCasesFactory,
    private readonly securityContext: SecurityContext,
  ) {}

  @DeleteBookingDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Delete(BOOKING_ENDPOINTS.DELETE)
  async deleteBooking(
    @Res({ passthrough: true }) res: Response,
    @Param('bookingId') bookingId: string,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<DeleteBookingResponse>
  > {
    const result =
      await this.bookingUseCasesFactory.deleteBookingUseCase.execute({
        id: bookingId,
        deletedBy: this.securityContext.userId,
      });

    if (!result.ok) {
      const errorResponse = mapBookingError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<DeleteBookingResponse>(
      { message: 'success' },
      HttpStatus.OK,
    );
  }
}
