import type { ErrorShape } from '../../shared';

/** An assignment for this class+group pair already exists (including soft-deleted ones that are still active).
 * @example { kind: 'class_group_assignment_already_exists', message: 'Class is already a member of this group', timestamp, classId: 'cls_01j...', classGroupId: 'grp_01j...' }
 */
export type ClassGroupAssignmentAlreadyExistsError = ErrorShape & {
  kind: 'class_group_assignment_already_exists';
  classId: string;
  classGroupId: string;
};

/** No membership was found for the given class+group pair.
 * @example { kind: 'class_group_assignment_not_found', message: 'Class is not a member of this group', timestamp, classId: 'cls_01j...', classGroupId: 'grp_01j...' }
 */
export type ClassGroupAssignmentNotFoundError = ErrorShape & {
  kind: 'class_group_assignment_not_found';
  classId: string;
  classGroupId: string;
};
