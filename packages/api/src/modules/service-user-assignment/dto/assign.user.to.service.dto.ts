import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import type { AssignUserToServiceInput } from '@pikslots/shared';

export class AssignUserToServiceDto implements AssignUserToServiceInput {
  @ApiProperty({ example: 'svc_01j...', description: 'ID of the service' })
  @IsString()
  @MinLength(1)
  serviceId: string;

  @ApiProperty({
    example: 'usr_01j...',
    description: 'ID of the user to assign',
  })
  @IsString()
  @MinLength(1)
  userId: string;

  @ApiProperty({
    example: 'biz_01j...',
    description: 'Business ID (denormalized)',
  })
  @IsString()
  @MinLength(1)
  businessId: string;
}
