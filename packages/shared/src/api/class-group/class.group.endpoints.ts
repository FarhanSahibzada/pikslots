export const CLASS_GROUP_ENDPOINTS = {
  REGISTER: '/class-groups',
  FIND_ALL_BY_BUSINESS: '/class-groups/by-business/:businessId',
  DELETE: '/class-groups/:classGroupId',
  EDIT: '/class-groups/:classGroupId',
} as const;
