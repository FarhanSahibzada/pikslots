import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';
import { PikSlotsTimezoneValidation } from 'src/shared/decorators/validations';

export class FindAllBookingsByBusinessForUserDto {
  @ApiProperty({
    description: 'Start date-time in ISO 8601 format',
    example: '2025-06-01',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}/, {
    message: 'startDateTime must be a valid date string (YYYY-MM-DD)',
  })
  startDateTime: string;

  @ApiProperty({
    description: 'End date-time in ISO 8601 format',
    example: '2025-06-30',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}/, {
    message: 'endDateTime must be a valid date string (YYYY-MM-DD)',
  })
  endDateTime: string;

  @ApiProperty({
    description: 'IANA timezone of the caller',
    example: 'Asia/Karachi',
  })
  @PikSlotsTimezoneValidation()
  timezone: string;
}
