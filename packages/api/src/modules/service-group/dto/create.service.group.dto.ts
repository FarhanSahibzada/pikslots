import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsArray,
  IsUUID,
} from 'class-validator';
import type { RegisterServiceGroupInput } from '@pikslots/shared';

export class RegisterServiceGroupDto implements RegisterServiceGroupInput {
  @ApiProperty({
    example: 'Color Services',
    description: 'Group name, unique per business',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 'biz_01j...',
    description: 'Business ID to create the group under',
  })
  @IsString()
  @MinLength(1)
  businessId: string;

  @ApiProperty({
    type: [String],
    example: ['019f3a2d-4c7f-7b8e-a2d5-e9f1c3057b84'],
    description: 'Services IDS to assign this service group',
  })
  @IsArray()
  @IsUUID('all', { each: true })
  associatedServices: string[];
}
