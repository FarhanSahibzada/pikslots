import { ApiProperty } from '@nestjs/swagger';
import type {
  UpdateBusinessAppearanceInput,
  BrandButtonShape,
  BrandTheme,
} from '@pikslots/shared';
import {
  PikSlotsEnumValidation,
  PikSlotsStringValidation,
} from 'src/shared/decorators/validations';
import { IsArray, IsUrl, ArrayMaxSize } from 'class-validator';

const BUTTON_SHAPES: BrandButtonShape[] = ['pill', 'rounded', 'rectangle'];
const THEMES: BrandTheme[] = ['system', 'light', 'dark'];

export class UpdateBusinessAppearanceDto implements UpdateBusinessAppearanceInput {
  @ApiProperty({ example: '#2980b9', description: 'Hex colour string' })
  @PikSlotsStringValidation(4, 9)
  brandColor: string;

  @ApiProperty({ enum: BUTTON_SHAPES })
  @PikSlotsEnumValidation(BUTTON_SHAPES)
  brandButtonShape: BrandButtonShape;

  @ApiProperty({ enum: THEMES })
  @PikSlotsEnumValidation(THEMES)
  theme: BrandTheme;

  @ApiProperty({
    type: [String],
    example: ['https://cdn.example.com/photo1.jpg'],
    description: 'Up to 10 gallery photo URLs',
  })
  @IsArray()
  @ArrayMaxSize(10)
  @IsUrl({}, { each: true })
  gallaryPhotosUrls: string[];
}
