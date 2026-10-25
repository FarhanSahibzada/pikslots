import { ApiPropertyOptional } from '@nestjs/swagger';
import type { FindAllAuditLogsQuery } from '@pikslots/shared';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class FindAllAuditLogsDto implements FindAllAuditLogsQuery {
  @ApiPropertyOptional({
    description:
      'Business to scope results to. Required for Business Owner/Admin callers (must match their own business); optional for a Platform Owner.',
    example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7d',
  })
  @IsOptional()
  @IsUUID()
  businessId?: string;

  @ApiPropertyOptional({ description: 'Filter by entity type', example: 'user' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({
    description: 'Filter by entity ID',
    example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7c',
  })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({
    description: 'Filter by the user who performed the action',
    example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7c',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filter by action name',
    example: 'audit.log.user.login',
  })
  @IsOptional()
  @IsString()
  action?: string;
}
