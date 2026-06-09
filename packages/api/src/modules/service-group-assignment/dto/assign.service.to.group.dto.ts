import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import type { AssignServiceToGroupInput } from '@pikslots/shared';

export class AssignServiceToGroupDto implements AssignServiceToGroupInput {
  @ApiProperty({ example: 'svc_01j...', description: 'ID of the service to assign' })
  @IsString()
  @MinLength(1)
  serviceId: string;

  @ApiProperty({ example: 'grp_01j...', description: 'Service group ID to assign the service to' })
  @IsString()
  @MinLength(1)
  serviceGroupId: string;

  @ApiProperty({ example: 'biz_01j...', description: 'Business ID (denormalized)' })
  @IsString()
  @MinLength(1)
  businessId: string;
}
