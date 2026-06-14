import type { ErrorShape } from '../../shared';

/** A service group with the same name already exists for this business.
 * @example { kind: 'service_group_already_exists', message: 'A group named "Color Services" already exists for this business', timestamp, name: 'Color Services', businessId: 'biz_01j...' }
 */
export type ServiceGroupAlreadyExistsInBusinessError = ErrorShape & {
  kind: 'service_group_already_exists';
  name: string;
  businessId: string;
};

/** No service group was found for the given lookup value.
 * @example { kind: 'service_group_not_found', message: 'Service group not found by id', timestamp, by: 'id', value: 'grp_01j...' }
 */
export type ServiceGroupNotFoundError = ErrorShape & {
  kind: 'service_group_not_found';
  by: 'id' | 'businessId';
  value: string;
};
