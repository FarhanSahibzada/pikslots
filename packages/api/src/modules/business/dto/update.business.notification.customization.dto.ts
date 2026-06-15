import { ApiProperty } from '@nestjs/swagger';
import type { UpdateBusinessNotificationCustomizationInput } from '@pikslots/shared';
import { IsString } from 'class-validator';

export class UpdateBusinessNotificationCustomizationDto implements UpdateBusinessNotificationCustomizationInput {
  @ApiProperty({ example: 'Acme Barbershop' })
  @IsString()
  emailSenderName: string;

  @ApiProperty({ example: 'Best regards,\nThe Acme Team' })
  @IsString()
  emailSignature: string;
}
