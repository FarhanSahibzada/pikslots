import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsString, Matches, ValidateNested } from 'class-validator';
import type {
  UpdateUserWorkingHoursInput,
  UserDayHours,
} from '@pikslots/shared';

const TIME_PATTERN = /^\d{2}:\d{2}$/;

class UserDayHoursDto implements UserDayHours {
  @ApiProperty({ example: true })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @Matches(TIME_PATTERN)
  openTime: string;

  @ApiProperty({ example: '17:00' })
  @IsString()
  @Matches(TIME_PATTERN)
  closeTime: string;
}

export class UpdateUserWorkingHoursDto implements UpdateUserWorkingHoursInput {
  @ApiProperty({ type: UserDayHoursDto })
  @ValidateNested()
  @Type(() => UserDayHoursDto)
  monday: UserDayHoursDto;

  @ApiProperty({ type: UserDayHoursDto })
  @ValidateNested()
  @Type(() => UserDayHoursDto)
  tuesday: UserDayHoursDto;

  @ApiProperty({ type: UserDayHoursDto })
  @ValidateNested()
  @Type(() => UserDayHoursDto)
  wednesday: UserDayHoursDto;

  @ApiProperty({ type: UserDayHoursDto })
  @ValidateNested()
  @Type(() => UserDayHoursDto)
  thursday: UserDayHoursDto;

  @ApiProperty({ type: UserDayHoursDto })
  @ValidateNested()
  @Type(() => UserDayHoursDto)
  friday: UserDayHoursDto;

  @ApiProperty({ type: UserDayHoursDto })
  @ValidateNested()
  @Type(() => UserDayHoursDto)
  saturday: UserDayHoursDto;

  @ApiProperty({ type: UserDayHoursDto })
  @ValidateNested()
  @Type(() => UserDayHoursDto)
  sunday: UserDayHoursDto;
}
