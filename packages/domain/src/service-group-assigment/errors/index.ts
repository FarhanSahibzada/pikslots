import type { ErrorShape } from '../../shared';

/** A assignment for this service+group pair already exists (including soft-deleted ones that are still active).
 * @example { kind: 'service_group_assignment_already_exists', message: 'Service is already a member of this group', timestamp, serviceId: 'svc_01j...', serviceGroupId: 'grp_01j...' }
 */
export type ServiceGroupAssigmentAlreadyExistsError = ErrorShape & {
  kind: 'service_group_assignment_already_exists';
  serviceId: string;
  serviceGroupId: string;
};

/** No membership was found for the given service+group pair.
 * @example { kind: 'service_group_membership_not_found', message: 'Service is not a member of this group', timestamp, serviceId: 'svc_01j...', serviceGroupId: 'grp_01j...' }
 */
export type ServiceGroupAssignmentNotFoundError = ErrorShape & {
  kind: 'service_group_assignment_not_found';
  serviceId: string;
  serviceGroupId: string;
};
