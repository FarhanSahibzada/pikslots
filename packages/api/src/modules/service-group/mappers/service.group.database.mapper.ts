import { ServiceGroup } from '@pikslots/domain';
import {
  domainAuditToPersistence,
  persistenceAuditToDomain,
} from 'src/shared/database/mapper/audit.fields.mapper';
import {
  ServiceGroupTableInsert,
  ServiceGroupTableSelect,
} from 'src/shared/database/schema/service.group.table';

export class ServiceGroupPersistenceMapper {
  public persistenceToDomain(row: ServiceGroupTableSelect): ServiceGroup {
    return ServiceGroup.reconstitute({
      id: row.id,
      name: row.name,
      businessId: row.business_id,
      ...persistenceAuditToDomain(row),
    });
  }

  public domainToPersistence(group: ServiceGroup): ServiceGroupTableInsert {
    return {
      id: group.id,
      name: group.name,
      business_id: group.businessId,
      ...domainAuditToPersistence(group),
    };
  }
}
