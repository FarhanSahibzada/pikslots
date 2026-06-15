import { ApiProperty } from '@nestjs/swagger';
import type {
  UpdateBusinessLocationInput,
  SupportedCurrencies,
} from '@pikslots/shared';
import {
  PikSlotsEnumValidation,
  PikSlotsStringValidation,
} from 'src/shared/decorators/validations';

const CURRENCIES: SupportedCurrencies[] = ['USD', 'PKR', 'RUB'];

export class UpdateBusinessLocationDto implements UpdateBusinessLocationInput {
  @ApiProperty({ example: '123 Main Street, Suite 4' })
  @PikSlotsStringValidation(0, 255)
  address: string;

  @ApiProperty({ example: 'San Francisco' })
  @PikSlotsStringValidation(0, 100)
  city: string;

  @ApiProperty({ example: 'California' })
  @PikSlotsStringValidation(0, 100)
  state: string;

  @ApiProperty({ example: '94102' })
  @PikSlotsStringValidation(0, 20)
  zip: string;

  @ApiProperty({ example: 'United States' })
  @PikSlotsStringValidation(0, 100)
  country: string;

  @ApiProperty({ enum: CURRENCIES, example: 'USD' })
  @PikSlotsEnumValidation(CURRENCIES)
  currency: SupportedCurrencies;
}
