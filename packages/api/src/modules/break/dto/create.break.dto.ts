import { ApiProperty } from '@nestjs/swagger';
import type { CreateBreakRequest } from '@pikslots/shared';
import type { WeekDay } from '@pikslots/shared';
import { IsUUID } from 'class-validator';
import {
  PikSlotsTimeValidation,
  PikSlotsWeekDayValidation,
} from 'src/shared/decorators/validations';

export class CreateBreakDto implements CreateBreakRequest {
  @ApiProperty({
    example: 'monday',
    enum: [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ],
  })
  @PikSlotsWeekDayValidation()
  day: WeekDay;

  @ApiProperty({ example: '09:00', description: 'Start time in HH:mm format' })
  @PikSlotsTimeValidation()
  startTime: string;

  @ApiProperty({ example: '09:30', description: 'End time in HH:mm format' })
  @PikSlotsTimeValidation()
  endTime: string;

  @ApiProperty({ example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7c' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7b' })
  @IsUUID()
  businessId: string;
}
