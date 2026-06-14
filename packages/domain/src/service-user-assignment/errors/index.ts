import type { ErrorShape } from '../../shared';

/** A service-user assignment already exists for this service+user pair.
 * @example { kind: 'service_user_assignment_already_exists', message: 'User is already assigned to this service', timestamp, serviceId: 'svc_01j...', userId: 'usr_01j...' }
 */
export type ServiceUserAssignmentAlreadyExistsError = ErrorShape & {
  kind: 'service_user_assignment_already_exists';
  serviceId: string;
  userId: string;
};

/** No service-user assignment was found for the given service+user pair.
 * @example { kind: 'service_user_assignment_not_found', message: 'User is not assigned to this service', timestamp, serviceId: 'svc_01j...', userId: 'usr_01j...' }
 */
export type ServiceUserAssignmentNotFoundError = ErrorShape & {
  kind: 'service_user_assignment_not_found';
  serviceId: string;
  userId: string;
};
