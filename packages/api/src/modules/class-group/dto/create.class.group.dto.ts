import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import type { RegisterClassGroupInput } from '@pikslots/shared';

export class RegisterClassGroupDto implements RegisterClassGroupInput {
  @ApiProperty({
    example: 'Morning Classes',
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
    description: 'Class IDs to assign to this class group',
  })
  @IsArray()
  @IsUUID('all', { each: true })
  associatedClasses: string[];
}
