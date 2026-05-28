import { ApiProperty } from '@nestjs/swagger';
import { PikSlotsEnumValidation } from 'src/shared/decorators/validations';
import type { GetUsersByRoleInput, UserRole } from '@pikslots/shared';

export class GetUsersByRoleDto implements GetUsersByRoleInput {
  @ApiProperty({
    enum: [
      'Platform Owner',
      'Business Owner',
      'No Access',
      'Standard',
      'Enhanced',
      'Admin',
    ],
    description: 'The role to query users by',
    example: 'Business Owner',
  })
  @PikSlotsEnumValidation([
    'Platform Owner',
    'Business Owner',
    'No Access',
    'Standard',
    'Enhanced',
    'Admin',
  ] as const satisfies UserRole[])
  role: UserRole;
}
