import type { ErrorShape } from '../../shared';

/** A class group with the same name already exists for this business.
 * @example { kind: 'class_group_already_exists', message: 'A group named "Morning Classes" already exists for this business', timestamp, name: 'Morning Classes', businessId: 'biz_01j...' }
 */
export type ClassGroupAlreadyExistsInBusinessError = ErrorShape & {
  kind: 'class_group_already_exists';
  name: string;
  businessId: string;
};

/** No class group was found for the given lookup value.
 * @example { kind: 'class_group_not_found', message: 'Class group not found by id', timestamp, by: 'id', value: 'grp_01j...' }
 */
export type ClassGroupNotFoundError = ErrorShape & {
  kind: 'class_group_not_found';
  by: 'id' | 'businessId';
  value: string;
};
