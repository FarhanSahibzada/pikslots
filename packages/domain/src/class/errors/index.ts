import type { ErrorShape } from '../../shared';

/** No class was found for the given lookup value.
 * @example { kind: 'class_not_found', message: 'Class not found by id', timestamp, by: 'id', value: 'cls_01j...' }
 */
export type ClassNotFoundError = ErrorShape & {
  kind: 'class_not_found';
  by: 'id' | 'businessId';
  value: string;
};
