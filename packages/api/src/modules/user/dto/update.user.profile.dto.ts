import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsIn,
} from 'class-validator';
import type { UpdateUserProfileInput, UserRole } from '@pikslots/shared';

export class UpdateUserProfileDto implements UpdateUserProfileInput {
  @ApiProperty({
    example: 'uuid',
    description: 'Target user ID (optional, for admins editing other users)',
    required: false,
  })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ example: 'John', description: 'First name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: '+12025551234',
    description: 'Phone number',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Enhanced',
    description: 'User role (Enhanced or Standard)',
    required: false,
    enum: ['Enhanced', 'Standard'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['Enhanced', 'Standard'])
  role?: UserRole;
}
