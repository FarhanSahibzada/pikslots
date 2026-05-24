import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FullNameInput, InviteUserInput } from '@pikslots/shared';
import {
  PikSlotsEmailValidation,
  PikSlotsEnumValidation,
  PikSlotsPhoneValidation,
  PikSlotsStringValidation,
  PikSlotsUsernameValidation,
} from 'src/shared/decorators/validations';
import type { UserRole } from '@pikslots/domain';

export class FullNameDto implements FullNameInput {
  @ApiProperty({ example: 'John' })
  @PikSlotsStringValidation(1, 50)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @PikSlotsStringValidation(1, 50)
  lastName: string;
}

export class InviteUserDto implements InviteUserInput {
  @ApiProperty({ example: 'john_doe', minLength: 3, maxLength: 30 })
  @PikSlotsUsernameValidation()
  username: string;

  @ApiProperty({ example: 'john@example.com', maxLength: 100 })
  @PikSlotsEmailValidation()
  email: string;

  @ApiProperty({ type: FullNameDto })
  @ValidateNested()
  @Type(() => FullNameDto)
  name: FullNameDto;

  @ApiProperty({
    enum: [
      'Platform Owner',
      'Business Owner',
      'No Access',
      'Standard',
      'Enhanced',
      'Admin',
    ],
  })
  @PikSlotsEnumValidation([
    'Business Owner',
    'Platform Owner',
    'No Access',
    'Standard',
    'Enhanced',
    'Admin',
  ] as const satisfies UserRole[])
  role: UserRole;

  @ApiPropertyOptional({ example: '+12025551234' })
  @PikSlotsPhoneValidation()
  phone?: string;
}
