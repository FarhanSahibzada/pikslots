import { DebounceCustomerSearchByBusinessRequest } from '@pikslots/shared';
import { PikSlotsStringValidation } from 'src/shared/decorators/validations';

export class DebounceCustomerSearchDto implements DebounceCustomerSearchByBusinessRequest {
  @PikSlotsStringValidation(1, 100)
  searchString: string;
}
