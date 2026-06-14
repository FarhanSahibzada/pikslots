export const PIKSLOT_EVENTS = {
  BUSINESS: {
    BUSINESS_REGISTRATION_INVITE: 'business.registration.invite',
  },
  USER: {
    USER_ASSIGN_TO_BUSINESS: 'user.assign.to.business',
  },
  // juntion table many to many
  SERVICE_GROUP_ASSIGNMENT: {
    SYNC_SERVICE_SERVICE_GROUPS: 'sync.service.service.groups',
    SYNC_SERVICE_GROUP_SERVICES: 'sync.service.group.services',
  },
  SERVICE_USER_ASSIGNMENT: {
    SYNC_SERVICE_TO_USERS: 'sync.service.to.users', // (single) service --> sync --> users (multiple)
  },
  // juntion table many to many
  CLASS_GROUP_ASSIGNMENT: {
    SYNC_CLASS_CLASS_GROUPS: 'sync.class.class.groups', // (single) class --> sync --> class groups (multiple)
    SYNC_CLASS_GROUP_CLASSES: 'sync.class.group.classes', // (single) class group --> sync --> classes (multiple)
  },
} as const;
