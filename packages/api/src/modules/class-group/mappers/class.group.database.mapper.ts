import { ClassGroup } from '@pikslots/domain';
import {
  domainAuditToPersistence,
  persistenceAuditToDomain,
} from 'src/shared/database/mapper/audit.fields.mapper';
import {
  ClassGroupTableInsert,
  ClassGroupTableSelect,
} from 'src/shared/database/schema/class.group.table';

export class ClassGroupPersistenceMapper {
  public persistenceToDomain(row: ClassGroupTableSelect): ClassGroup {
    return ClassGroup.reconstitute({
      id: row.id,
      name: row.name,
      businessId: row.business_id,
      ...persistenceAuditToDomain(row),
    });
  }

  public domainToPersistence(group: ClassGroup): ClassGroupTableInsert {
    return {
      id: group.id,
      name: group.name,
      business_id: group.businessId,
      ...domainAuditToPersistence(group),
    };
  }
}
