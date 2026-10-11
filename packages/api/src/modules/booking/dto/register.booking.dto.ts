import { ApiProperty } from '@nestjs/swagger';
import type {
  RegisterBookingRequest,
  ServiceSnapshotRequest,
} from '@pikslots/shared';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ServiceSnapshotDto implements ServiceSnapshotRequest {
  @ApiProperty({ example: 'Haircut', description: 'Name of the service' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 30, description: 'Service duration in minutes' })
  @IsNumber()
  @Min(1)
  durationInMins: number;

  @ApiProperty({
    example: 2500,
    description: 'Cost in smallest currency unit (e.g. cents)',
  })
  @IsNumber()
  @Min(0)
  cost: number;

  @ApiProperty({
    example: '#0d9488',
    description: 'Service color code',
  })
  @IsString()
  @IsNotEmpty()
  colorCode: string;
}

export class RegisterBookingDto implements RegisterBookingRequest {
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

  @ApiProperty({ example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7b' })
  @IsUUID('7')
  businessId: string;

  @ApiProperty({ example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7c' })
  @IsUUID()
  serviceId: string;

  @ApiProperty({
    example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7d',
    description: 'User this booking is assigned to',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7e' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ type: ServiceSnapshotDto })
  @IsObject()
  @ValidateNested()
  @Type(() => ServiceSnapshotDto)
  serviceSnapshot: ServiceSnapshotDto;

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
