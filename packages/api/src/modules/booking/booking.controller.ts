import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { PikslotsBaseResponse } from 'src/shared/types/base.response';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { RolesGuard } from 'src/shared/security/guards/roles.guard';
import { Roles } from 'src/shared/security/guards/roles.decorator';
import { mapBookingError } from './errors/booking.errors.map';
import { BOOKING_ENDPOINTS } from '@pikslots/shared';
import type {
  DeleteBookingResponse,
  EditBookingResponse,
  FindAllBookingsByBusinessForUserResponse,
  FindBookingByIdResponse,
  RegisterBookingResponse,
} from '@pikslots/shared';
import {
  DeleteBookingDocs,
  EditBookingDocs,
  FindAllBookingsByBusinessForUserDocs,
  FindBookingByIdDocs,
  RegisterBookingDocs,
} from './docs/booking.controller.docs';
import { BookingUseCasesFactory } from './factory/booking.usecases.factory';
import { RegisterBookingDto } from './dto/register.booking.dto';
import { EditBookingDto } from './dto/edit.booking.dto';
import { FindAllBookingsByBusinessForUserDto } from './dto/find.all.bookings.by.business.for.user.dto';

@ApiTags('Bookings')
@Controller('')
export class BookingController {
  constructor(
    private readonly bookingUseCasesFactory: BookingUseCasesFactory,
    private readonly securityContext: SecurityContext,
  ) {}

  @RegisterBookingDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Enhanced', 'Standard')
  @Post(BOOKING_ENDPOINTS.REGISTER)
  async registerBooking(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: RegisterBookingDto,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<RegisterBookingResponse>
  > {
    const result =
      await this.bookingUseCasesFactory.registerBookingUseCase.execute({
        bookingDate: dto.bookingDate,
        bookingStartTime: dto.bookingStartTime,
        bookingEndTime: dto.bookingEndTime,
        businessId: dto.businessId,
        serviceId: dto.serviceId,
        userId: dto.userId,
        customerId: dto.customerId,
        serviceSnapshot: dto.serviceSnapshot,
        createdBy: this.securityContext.userId,
        label: dto.label,
        notes: dto.notes,
      });

    if (!result.ok) {
      const errorResponse = mapBookingError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.CREATED);
    return new PikslotsBaseResponse<RegisterBookingResponse>(
      { message: 'success' },
      HttpStatus.CREATED,
    );
  }

  @FindAllBookingsByBusinessForUserDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Enhanced', 'Standard')
  @Get(BOOKING_ENDPOINTS.FIND_ALL_BY_BUSINESS_FOR_USER)
  async findAllBookingsByBusinessForUser(
    @Res({ passthrough: true }) res: Response,
    @Param('businessId') businessId: string,
    @Param('userId') userId: string,
    @Query() query: FindAllBookingsByBusinessForUserDto,
  ): Promise<
    | PikslotsBaseErrorResponse
    | PikslotsBaseResponse<FindAllBookingsByBusinessForUserResponse>
  > {
    const result =
      await this.bookingUseCasesFactory.findAllBookingsByBusinessUseCase.execute(
        businessId,
        userId,
        query.startDateTime,
        query.endDateTime,
        query.timezone,
      );

    if (!result.ok) {
      const errorResponse = mapBookingError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<FindAllBookingsByBusinessForUserResponse>(
      result.value.map((b) => ({
        id: b.id,
        bookingId: b.bookingId,
        bookingDate: b.bookingDate,
        bookingStartTime: b.bookingStartTime,
        bookingEndTime: b.bookingEndTime,
        userId: b.userId,
        serviceSnapshot: b.serviceSnapshot,
        serviceId: b.serviceId,
        customerId: b.customerId,
        label: b.label,
        notes: b.notes,
      })),
      HttpStatus.OK,
    );
  }

  @FindBookingByIdDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Enhanced', 'Standard')
  @Get(BOOKING_ENDPOINTS.FIND_BY_ID)
  async findBookingById(
    @Res({ passthrough: true }) res: Response,
    @Param('bookingId') bookingId: string,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<FindBookingByIdResponse>
  > {
    const result =
      await this.bookingUseCasesFactory.findBookingByIdUseCase.execute({
        bookingId,
      });

    if (!result.ok) {
      const errorResponse = mapBookingError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    const b = result.value;
    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<FindBookingByIdResponse>(
      {
        id: b.id,
        bookingId: b.bookingId,
        bookingDate: b.bookingDate,
        bookingStartTime: b.bookingStartTime,
        bookingEndTime: b.bookingEndTime,
        businessId: b.businessId,
        serviceSnapshot: b.serviceSnapshot,
        serviceId: b.serviceId,
        customerId: b.customerId,
        userId: b.userId,
        label: b.label,
        notes: b.notes,
        createdAt: b.createdAt.toISOString(),
        createdBy: b.createdBy,
        updatedAt: b.updatedAt.toISOString(),
        updatedBy: b.updatedBy,
        deletedAt: b.deletedAt ? b.deletedAt.toISOString() : null,
        deletedBy: b.deletedBy,
        isDeleted: b.isDeleted,
      },
      HttpStatus.OK,
    );
  }

  @EditBookingDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Enhanced', 'Standard')
  @Patch(BOOKING_ENDPOINTS.EDIT)
  async editBooking(
    @Res({ passthrough: true }) res: Response,
    @Param('bookingId') bookingId: string,
    @Body() dto: EditBookingDto,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<EditBookingResponse>
  > {
    const result = await this.bookingUseCasesFactory.editBookingUseCase.execute(
      {
        bookingId,
        bookingDate: dto.bookingDate,
        bookingStartTime: dto.bookingStartTime,
        bookingEndTime: dto.bookingEndTime,
        serviceId: dto.serviceId,
        customerId: dto.customerId,
        userId: dto.userId,
        updatedBy: this.securityContext.userId,
        label: dto.label,
        notes: dto.notes,
      },
    );

    if (!result.ok) {
      const errorResponse = mapBookingError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<EditBookingResponse>(
      { message: 'success' },
      HttpStatus.OK,
    );
  }

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
