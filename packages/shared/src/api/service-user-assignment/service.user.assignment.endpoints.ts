export const SERVICE_USER_ASSIGNMENT_ENDPOINTS = {
  ASSIGN_USER: '/service-user-assignments',
  REMOVE_USER: '/service-user-assignments/:serviceId/users/:userId',
  FIND_BY_SERVICE: '/service-user-assignments/by-service/:serviceId',
  FIND_SERVICES_BY_USER: '/service-user-assignments/by-user/:userId',
} as const;
