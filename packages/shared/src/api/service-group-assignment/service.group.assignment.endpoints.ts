export const SERVICE_GROUP_ASSIGNMENT_ENDPOINTS = {
  FIND_BY_GROUP: '/service-group-assignments/by-group/:serviceGroupId',
  FIND_GROUPS_BY_SERVICE: '/service-group-assignments/by-service/:serviceId/groups',
} as const;
