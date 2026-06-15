import { ApiProperty } from '@nestjs/swagger';
import type {
  UpdateBusinessBookingCustomizationInput,
  WeekDay,
} from '@pikslots/shared';
import {
  PikSlotsEnumValidation,
  PikSlotsStringValidation,
} from 'src/shared/decorators/validations';
import { IsBoolean } from 'class-validator';

const TIME_FORMATS = ['12 hours', '24 hours'] as const;
const WEEK_DAYS: WeekDay[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export class UpdateBusinessBookingCustomizationDto implements UpdateBusinessBookingCustomizationInput {
  @ApiProperty({ example: 'en' })
  @PikSlotsStringValidation(2, 10)
  language: string;

  @ApiProperty({ enum: TIME_FORMATS, example: '12 hours' })
  @PikSlotsEnumValidation([...TIME_FORMATS])
  timeFormat: '12 hours' | '24 hours';

  @ApiProperty({ enum: WEEK_DAYS, example: 'monday' })
  @PikSlotsEnumValidation(WEEK_DAYS)
  weekStartsOn: WeekDay;

  @ApiProperty() @IsBoolean() showBookAnotherAppointmentButton: boolean;
  @ApiProperty() @IsBoolean() showServiceAndClassPrices: boolean;
  @ApiProperty() @IsBoolean() showServiceAndClassDuration: boolean;
  @ApiProperty() @IsBoolean() showBusinessHours: boolean;
  @ApiProperty() @IsBoolean() showLocalTime: boolean;

  @ApiProperty({ example: 'Service' })
  @PikSlotsStringValidation(0, 100)
  labelService: string;
  @ApiProperty({ example: 'Class' })
  @PikSlotsStringValidation(0, 100)
  labelClass: string;
  @ApiProperty({ example: 'Team member' })
  @PikSlotsStringValidation(0, 100)
  labelTeamMember: string;
  @ApiProperty({ example: 'City' })
  @PikSlotsStringValidation(0, 100)
  labelCity: string;
  @ApiProperty({ example: 'State' })
  @PikSlotsStringValidation(0, 100)
  labelState: string;
  @ApiProperty({ example: 'Postal code' })
  @PikSlotsStringValidation(0, 100)
  labelPostalCode: string;

  @ApiProperty({ example: '' })
  @PikSlotsStringValidation(0, 255)
  termsLabel: string;
  @ApiProperty({ example: '' })
  @PikSlotsStringValidation(0, 500)
  termsLink: string;
  @ApiProperty() @IsBoolean() requireTermsAcceptance: boolean;

  @ApiProperty({ example: '' })
  @PikSlotsStringValidation(0, 255)
  redirectLabel: string;
  @ApiProperty({ example: '' })
  @PikSlotsStringValidation(0, 500)
  redirectLink: string;
}
