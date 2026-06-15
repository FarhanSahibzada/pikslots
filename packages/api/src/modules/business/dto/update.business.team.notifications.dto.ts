import { ApiProperty } from '@nestjs/swagger';
import type {
  UpdateBusinessTeamNotificationsInput,
  TimeUnit,
  NotificationType,
} from '@pikslots/shared';
import { PikSlotsEnumValidation } from 'src/shared/decorators/validations';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';

const TIME_UNITS: TimeUnit[] = ['minutes', 'hours', 'days', 'weeks', 'months'];
const NOTIFICATION_TYPES: NotificationType[] = ['email', 'sms'];

class ReminderTimeDto {
  @ApiProperty() @IsBoolean() active: boolean;

  @ApiProperty({ enum: NOTIFICATION_TYPES, example: 'email' })
  @PikSlotsEnumValidation(NOTIFICATION_TYPES)
  type: NotificationType;

  @ApiProperty({ enum: TIME_UNITS, example: 'hours' })
  @PikSlotsEnumValidation(TIME_UNITS)
  unit: TimeUnit;

  @ApiProperty({ example: 24 })
  @IsInt()
  @Min(0)
  value: number;
}

export class UpdateBusinessTeamNotificationsDto implements UpdateBusinessTeamNotificationsInput {
  @ApiProperty() @IsBoolean() notifyBookingConfirmation: boolean;
  @ApiProperty() @IsBoolean() notifyBookingChanges: boolean;
  @ApiProperty() @IsBoolean() notifyBookingCancellations: boolean;

  @ApiProperty({ type: ReminderTimeDto })
  @ValidateNested()
  @Type(() => ReminderTimeDto)
  bookingRemindersTime: {
    active: boolean;
    type: NotificationType;
    unit: TimeUnit;
    value: number;
  };

  @ApiProperty({ type: [String], example: [] })
  @IsArray()
  @IsEmail({}, { each: true })
  extraCCEmails: string[];
}
