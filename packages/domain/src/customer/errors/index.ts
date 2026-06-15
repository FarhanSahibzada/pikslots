import type { ErrorShape } from '../../shared';

/** No customer was found for the given lookup value.
 * @example { kind: 'customer_not_found', message: 'Customer not found by id', timestamp, by: 'id', value: 'cus_01j...' }
 */
export type CustomerNotFoundError = ErrorShape & {
  kind: 'customer_not_found';
  by: 'id' | 'email';
  value: string;
};

/** A customer with the same email already exists for this business.
 * @example { kind: 'customer_already_exists', message: 'A customer with this email already exists', timestamp, email: 'foo@bar.com', businessId: 'biz_01j...' }
 */
export type CustomerAlreadyExistsError = ErrorShape & {
  kind: 'customer_already_exists';
  email: string;
  businessId: string;
};
