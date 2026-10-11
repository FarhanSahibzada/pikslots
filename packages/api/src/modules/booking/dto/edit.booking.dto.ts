import { ApiProperty } from '@nestjs/swagger';
import type { EditBookingRequest } from '@pikslots/shared';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class EditBookingDto implements EditBookingRequest {
  @ApiProperty({
    example: '2025-06-16',
    description: 'Booking date (YYYY-MM-DD)',
  })
  @IsString()
  @IsNotEmpty()
  bookingDate: string;

  @ApiProperty({
    example: '2025-06-16T09:00:00.000Z',
    description: 'Booking start time as ISO 8601 UTC datetime string',
  })
  @IsDateString()
  bookingStartTime: string;

  @ApiProperty({
    example: '2025-06-16T10:00:00.000Z',
    description: 'Booking end time as ISO 8601 UTC datetime string',
  })
  @IsDateString()
  bookingEndTime: string;

  @ApiProperty({ example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7c' })
  @IsUUID()
  serviceId: string;

  @ApiProperty({ example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7e' })
  @IsUUID()
  customerId: string;

  @ApiProperty({
    example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7d',
    description: 'User this booking is assigned to',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: 'Confirmed',
    description: 'Booking label',
    required: false,
  })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({
    example: 'Preferred morning slot',
    description: 'Optional notes for the booking',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
