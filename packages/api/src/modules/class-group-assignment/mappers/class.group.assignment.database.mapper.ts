import { ClassGroupAssignment } from '@pikslots/domain';
import {
  domainAuditToPersistence,
  persistenceAuditToDomain,
} from 'src/shared/database/mapper/audit.fields.mapper';
import {
  ClassGroupAssignmentTableInsert,
  ClassGroupAssignmentTableSelect,
} from 'src/shared/database/schema/class.group.assignment.table';

export class ClassGroupAssignmentPersistenceMapper {
  public persistenceToDomain(
    row: ClassGroupAssignmentTableSelect,
  ): ClassGroupAssignment {
    return ClassGroupAssignment.reconstitute({
      id: row.id,
      classId: row.class_id,
      classGroupId: row.class_group_id,
      businessId: row.business_id,
      ...persistenceAuditToDomain(row),
    });
  }

  public domainToPersistence(
    assignment: ClassGroupAssignment,
  ): ClassGroupAssignmentTableInsert {
    return {
      id: assignment.id,
      class_id: assignment.classId,
      class_group_id: assignment.classGroupId,
      business_id: assignment.businessId,
      ...domainAuditToPersistence(assignment),
    };
  }
}
