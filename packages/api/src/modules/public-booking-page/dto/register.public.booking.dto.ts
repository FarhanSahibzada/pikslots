import { ApiProperty } from '@nestjs/swagger';
import type { RegisterPublicBookingRequest } from '@pikslots/shared';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PublicBookingContactDto {
  @ApiProperty({ example: 'Jane', description: 'Guest first name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Guest last name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  lastName: string;

  @ApiProperty({ example: 'jane@example.com', nullable: true, required: false })
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ApiProperty({ example: '+15551234567', nullable: true, required: false })
  @IsOptional()
  @IsString()
  phone?: string | null;

  @ApiProperty({ example: '123 Main St', nullable: true, required: false })
  @IsOptional()
  @IsString()
  address?: string | null;

  @ApiProperty({
    example: { 'Preferred stylist': 'Any' },
    description: 'Enabled custom contact fields keyed by label',
    required: false,
  })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, string>;
}

export class RegisterPublicBookingDto implements RegisterPublicBookingRequest {
  @ApiProperty({ example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7b' })
  @IsUUID('7')
  businessId: string;

  @ApiProperty({ example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7c' })
  @IsUUID()
  serviceId: string;

  @ApiProperty({
    example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7d',
    description: 'Assigned team member',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: '2026-06-16', description: 'YYYY-MM-DD' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  bookingDate: string;

  @ApiProperty({
    example: '2026-06-16T09:00:00.000Z',
    description: 'Booking start time as ISO 8601 UTC datetime string',
  })
  @IsDateString()
  bookingStartTime: string;

  @ApiProperty({
    example: '2026-06-16T10:00:00.000Z',
    description: 'Booking end time as ISO 8601 UTC datetime string',
  })
  @IsDateString()
  bookingEndTime: string;

  @ApiProperty({ type: PublicBookingContactDto })
  @ValidateNested()
  @Type(() => PublicBookingContactDto)
  contact: PublicBookingContactDto;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  termsAccepted?: boolean;
}
