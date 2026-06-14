import { ServiceUserAssignment } from '@pikslots/domain';
import {
  domainAuditToPersistence,
  persistenceAuditToDomain,
} from 'src/shared/database/mapper/audit.fields.mapper';
import {
  ServiceUserAssignmentTableInsert,
  ServiceUserAssignmentTableSelect,
} from 'src/shared/database/schema/service.user.assignment.table';

export class ServiceUserAssignmentPersistenceMapper {
  public persistenceToDomain(row: ServiceUserAssignmentTableSelect): ServiceUserAssignment {
    return ServiceUserAssignment.reconstitute({
      id: row.id,
      serviceId: row.service_id,
      userId: row.user_id,
      businessId: row.business_id,
      ...persistenceAuditToDomain(row),
    });
  }

  public domainToPersistence(assignment: ServiceUserAssignment): ServiceUserAssignmentTableInsert {
    return {
      id: assignment.id,
      service_id: assignment.serviceId,
      user_id: assignment.userId,
      business_id: assignment.businessId,
      ...domainAuditToPersistence(assignment),
    };
  }
}
