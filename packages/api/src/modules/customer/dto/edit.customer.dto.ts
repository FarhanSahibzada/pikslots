import { ApiProperty } from '@nestjs/swagger';
import { SocialPlatforms } from '@pikslots/domain';
import { EditCustomerInput } from '@pikslots/shared';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsEmail,
  MaxLength,
  MinLength,
  IsObject,
} from 'class-validator';

export class EditCustomerDto implements Omit<EditCustomerInput, 'id'> {
  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  lastName: string;

  @ApiProperty({
    example: 'https://cdn.example.com/avatar.jpg',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  profileImageUrl: string | null;

  @ApiProperty({ example: 'john@example.com', nullable: true })
  @IsOptional()
  @IsEmail()
  email: string | null;

  @ApiProperty({ example: 'john.work@example.com', nullable: true })
  @IsOptional()
  @IsEmail()
  additionalEmail: string | null;

  @ApiProperty({ example: '+15551234567', nullable: true })
  @IsOptional()
  @IsString()
  primaryPhone: string | null;

  @ApiProperty({ example: '+15557654321', nullable: true })
  @IsOptional()
  @IsString()
  additionalPhone: string | null;

  @ApiProperty({ example: 'Acme Corp', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  company: string | null;

  @ApiProperty({ example: 'United States', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country: string | null;

  @ApiProperty({ example: '123 Main St', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address: string | null;

  @ApiProperty({ example: 'New York', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city: string | null;

  @ApiProperty({ example: 'NY', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state: string | null;

  @ApiProperty({ example: '10001', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  zipCode: string | null;

  @ApiProperty({ example: 'Prefers morning appointments', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  notes: string | null;

  @ApiProperty({ example: { Instagram: 'https://instagram.com/johndoe' } })
  @IsObject()
  customerSocialLinks: Record<SocialPlatforms, string>;

  @ApiProperty({ example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7b' })
  @IsUUID('7')
  businessId: string;
}
