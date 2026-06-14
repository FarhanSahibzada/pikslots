import { ServiceGroupAssignment } from '@pikslots/domain';
import {
  domainAuditToPersistence,
  persistenceAuditToDomain,
} from 'src/shared/database/mapper/audit.fields.mapper';
import {
  ServiceGroupAssignmentTableInsert,
  ServiceGroupAssignmentTableSelect,
} from 'src/shared/database/schema/service.group.assignment.table';

export class ServiceGroupAssignmentPersistenceMapper {
  public persistenceToDomain(row: ServiceGroupAssignmentTableSelect): ServiceGroupAssignment {
    return ServiceGroupAssignment.reconstitute({
      id: row.id,
      serviceId: row.service_id,
      serviceGroupId: row.service_group_id,
      businessId: row.business_id,
      ...persistenceAuditToDomain(row),
    } as unknown as ServiceGroupAssignment);
  }

  public domainToPersistence(assignment: ServiceGroupAssignment): ServiceGroupAssignmentTableInsert {
    return {
      id: assignment.id,
      service_id: assignment.serviceId,
      service_group_id: assignment.serviceGroupId,
      business_id: assignment.businessId,
      ...domainAuditToPersistence(assignment),
    };
  }
}
