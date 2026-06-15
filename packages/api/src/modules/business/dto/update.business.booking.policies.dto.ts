import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  UpdateBusinessBookingPoliciesInput,
  TimeUnit,
} from '@pikslots/shared';
import {
  PikSlotsEnumValidation,
  PikSlotsStringValidation,
} from 'src/shared/decorators/validations';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';

const TIME_UNITS: TimeUnit[] = ['minutes', 'hours', 'days', 'weeks', 'months'];

class TimeValueDto {
  @ApiProperty({ enum: TIME_UNITS, example: 'hours' })
  @PikSlotsEnumValidation(TIME_UNITS)
  unit: TimeUnit;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  value: number;
}

export class UpdateBusinessBookingPoliciesDto implements UpdateBusinessBookingPoliciesInput {
  @ApiProperty({ type: TimeValueDto })
  @ValidateNested()
  @Type(() => TimeValueDto)
  leadTime: { unit: TimeUnit; value: number };

  @ApiProperty({ type: TimeValueDto })
  @ValidateNested()
  @Type(() => TimeValueDto)
  scheduleWindow: { unit: TimeUnit; value: number };

  @ApiPropertyOptional({
    type: TimeValueDto,
    nullable: true,
    description: 'null = customers can cancel any time',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TimeValueDto)
  cancellationPolicy: { unit: TimeUnit; value: number } | null;

  @ApiProperty({ example: 'No refunds within 24 hours of the appointment.' })
  @PikSlotsStringValidation(0, 2000)
  bookingPolicyText: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  showPolicyOnBookingPage: boolean;
}
