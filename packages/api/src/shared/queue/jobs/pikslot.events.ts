export const AUDIT_LOG_QUEUE = 'audit.log' as const;

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
  AUDIT_LOG: {
    USER_LOGIN: 'audit.log.user.login',
    USER_LOGOUT: 'audit.log.user.logout',
    USER_INVITED: 'audit.log.user.invited',
    USER_INVITE_ACCEPTED: 'audit.log.user.invite.accepted',
    USER_INVITE_OTP_REQUESTED: 'audit.log.user.invite.otp.requested',
    USER_PROFILE_UPDATED: 'audit.log.user.profile.updated',
    USER_WORKING_HOURS_UPDATED: 'audit.log.user.working.hours.updated',
    BUSINESS_REGISTERED: 'audit.log.business.registered',
    BOOKING_CREATED: 'audit.log.booking.created',
    BOOKING_UPDATED: 'audit.log.booking.updated',
    BOOKING_DELETED: 'audit.log.booking.deleted',
    SERVICE_CREATED: 'audit.log.service.created',
    SERVICE_UPDATED: 'audit.log.service.updated',
    SERVICE_DELETED: 'audit.log.service.deleted',
    CLASS_CREATED: 'audit.log.class.created',
    CLASS_UPDATED: 'audit.log.class.updated',
    CLASS_DELETED: 'audit.log.class.deleted',
    CUSTOMER_CREATED: 'audit.log.customer.created',
    CUSTOMER_UPDATED: 'audit.log.customer.updated',
    CUSTOMER_DELETED: 'audit.log.customer.deleted',
    TIMEOFF_CREATED: 'audit.log.timeoff.created',
    TIMEOFF_UPDATED: 'audit.log.timeoff.updated',
    TIMEOFF_DELETED: 'audit.log.timeoff.deleted',
    SERVICE_USER_ASSIGNED: 'audit.log.service.user.assigned',
    SERVICE_USER_UNASSIGNED: 'audit.log.service.user.unassigned',
  },
} as const;
