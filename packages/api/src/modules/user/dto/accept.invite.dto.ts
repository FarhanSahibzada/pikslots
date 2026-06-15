import { ApiProperty } from '@nestjs/swagger';
import type { AcceptInviteInput } from '@pikslots/shared';
import { IsString, Length } from 'class-validator';
import { PikSlotsStringValidation } from 'src/shared/decorators/validations';

export class AcceptInviteDto implements AcceptInviteInput {
  @ApiProperty({ description: 'Signed invite JWT from the invite URL' })
  @IsString()
  token: string;

  @ApiProperty({
    description: "6-digit OTP sent to the user's email",
    example: '123456',
  })
  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp: string;

  @ApiProperty({ description: 'New password (min 8 characters)', minLength: 8 })
  @PikSlotsStringValidation(8, 100)
  newPassword: string;
}
