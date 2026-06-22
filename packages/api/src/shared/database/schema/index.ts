import type { AuditFields } from './audit.table';
import { UserTable } from './user.table';
import { BusinessTable } from './business.table';
import { ServiceTable } from './service.table';
import { ServiceGroupTable } from './service.group.table';
import { ServiceGroupAssignmentTable } from './service.group.assignment.table';
import { ServiceUserAssignmentTable } from './service.user.assignment.table';
import { ClassTable } from './class.table';
import { ClassGroupTable } from './class.group.table';
import { ClassGroupAssignmentTable } from './class.group.assignment.table';
import { CustomerTable } from './customer.table';
import { BookingTable } from './booking.table';

export type { AuditFields };

export interface PikSlotsDatabase {
  users: UserTable;
  businesses: BusinessTable;
  services: ServiceTable;
  service_groups: ServiceGroupTable;
  service_group_assignments: ServiceGroupAssignmentTable;
  service_user_assignments: ServiceUserAssignmentTable;
  classes: ClassTable;
  class_groups: ClassGroupTable;
  class_group_assignments: ClassGroupAssignmentTable;
  customers: CustomerTable;
  bookings: BookingTable;
}
