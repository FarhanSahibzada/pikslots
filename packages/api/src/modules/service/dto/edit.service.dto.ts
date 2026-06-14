import { ApiProperty } from '@nestjs/swagger';
import { UpdateServiceInput } from '@pikslots/shared';
import {
  IsArray,
  ArrayMaxSize,
  IsUrl,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  MaxLength,
  MinLength,
  IsBoolean,
} from 'class-validator';

export class EditServiceDto implements Omit<UpdateServiceInput, 'id'> {
  @ApiProperty({
    example: 'Haircut',
    description: 'Service title, unique per business',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'A professional haircut service' })
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

  @ApiProperty({ example: 30, description: 'Service duration in minutes' })
  @IsNumber()
  @Min(1)
  durationInMins: number;

  @ApiProperty({
    example: 10,
    description: 'Buffer time between bookings in minutes',
  })
  @IsNumber()
  @Min(0)
  bufferTimeInMins: number;

  @ApiProperty({
    example: 2500,
    description: 'Cost in smallest currency unit (e.g. cents)',
  })
  @IsNumber()
  @Min(0)
  cost: number;

  @ApiProperty({
    type: [String],
    example: ['019f3a2c-8b1e-7d4f-9a3b-c5e7f2814d60'],
    description: 'User IDs of team members who will provide this service',
  })
  @IsArray()
  @IsUUID('all', { each: true })
  associatedUsers: string[];

  @ApiProperty({
    type: [String],
    example: ['019f3a2d-4c7f-7b8e-a2d5-e9f1c3057b84'],
    description: 'Service group IDs to assign this service to',
  })
  @IsArray()
  @IsUUID('all', { each: true })
  associatedServiceGroups: string[];

  @ApiProperty({ example: false })
  @IsBoolean()
  isHiddenFromBookingPage: boolean;

  @ApiProperty({ example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7b' })
  @IsUUID('7')
  businessId: string;
}
