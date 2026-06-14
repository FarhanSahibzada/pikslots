import { ApiProperty } from '@nestjs/swagger';
import { RegisterClassInput } from '@pikslots/shared';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsNumber,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class RegisterClassDto implements RegisterClassInput {
  @ApiProperty({
    example: 'Yoga Basics',
    description: 'Class title, unique per business',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'A beginner-friendly yoga class' })
  @IsString()
  @MinLength(1)
  description: string;

  @ApiProperty({
    type: [String],
    example: [],
    description: 'Up to 5 image URLs',
  })
  @IsArray()
  @ArrayMaxSize(5)
  @IsUrl({}, { each: true })
  imagesUrls: string[];

  @ApiProperty({ example: 60, description: 'Class duration in minutes' })
  @IsNumber()
  @Min(1)
  durationInMins: number;

  @ApiProperty({ example: 10, description: 'Number of seats available' })
  @IsNumber()
  @Min(1)
  seats: number;

  @ApiProperty({
    example: 1500,
    description: 'Cost in smallest currency unit (e.g. cents)',
  })
  @IsNumber()
  @Min(0)
  cost: number;

  @ApiProperty({ example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7b' })
  @IsUUID('7')
  businessId: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  isHiddenFromBookingPage: boolean;

  @ApiProperty({
    type: [String],
    example: [],
    description: 'Class group IDs to associate this class with on creation',
  })
  @IsArray()
  @IsUUID('7', { each: true })
  associatedClassGroupIds: string[];
}
