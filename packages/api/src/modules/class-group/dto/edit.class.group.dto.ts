import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import type { EditClassGroupInput } from '@pikslots/shared';

export class EditClassGroupDto implements EditClassGroupInput {
  @ApiProperty({
    example: 'Morning Classes',
    description: 'Updated group name, unique per business',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 'biz_01j...',
    description: 'Business ID the group belongs to',
  })
  @IsString()
  @MinLength(1)
  businessId: string;

  @ApiProperty({
    type: [String],
    example: ['019f3a2d-4c7f-7b8e-a2d5-e9f1c3057b84'],
    description: 'Full desired list of class IDs for this group',
  })
  @IsArray()
  @IsUUID('all', { each: true })
  classIds: string[];
}
