import type { ErrorShape } from '../../shared';

/** No service was found for the given lookup value.
 * @example { kind: 'service_not_found', message: 'Service not found by id', timestamp, by: 'id', value: 'svc_01j...' }
 */
export type ServiceNotFoundError = ErrorShape & {
  kind: 'service_not_found';
  by: 'id' | 'businessId';
  value: string;
};
