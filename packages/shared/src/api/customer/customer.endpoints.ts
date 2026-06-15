export const CUSTOMER_ENDPOINTS = {
  REGISTER: '/customers/register',
  FIND_ALL_BY_BUSINESS: '/customers/by-business/:businessId',
  EDIT: '/customers/:customerId',
  DELETE: '/customers/:customerId',
} as const;
