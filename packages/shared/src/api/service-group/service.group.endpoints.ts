export const SERVICE_GROUP_ENDPOINTS = {
  REGISTER: '/service-groups',
  FIND_ALL_BY_BUSINESS: '/service-groups/by-business/:businessId',
  DELETE: '/service-groups/:serviceGroupId',
  EDIT: '/service-groups/:serviceGroupId',
} as const;
