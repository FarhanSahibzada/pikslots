import { ApiProperty } from '@nestjs/swagger';
import type { UpdateBusinessVisibilityInput } from '@pikslots/shared';
import { IsBoolean } from 'class-validator';

export class UpdateBusinessVisibilityDto implements UpdateBusinessVisibilityInput {
  @ApiProperty({
    example: true,
    description: 'Show business in search results',
  })
  @IsBoolean()
  appearInSearchResults: boolean;
}
