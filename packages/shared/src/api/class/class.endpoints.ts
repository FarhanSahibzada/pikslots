export const CLASS_ENDPOINTS = {
  REGISTER: '/classes/register',
  FIND_ALL_BY_BUSINESS: '/classes/by-business/:businessId',
  UPDATE: '/classes/:classId',
  DELETE: '/classes/:classId',
} as const;
