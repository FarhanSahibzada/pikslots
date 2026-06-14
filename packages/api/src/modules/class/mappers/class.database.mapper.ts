import { Class } from '@pikslots/domain';
import {
  domainAuditToPersistence,
  persistenceAuditToDomain,
} from 'src/shared/database/mapper/audit.fields.mapper';
import {
  ClassTableInsert,
  ClassTableSelect,
} from 'src/shared/database/schema/class.table';

export class ClassPersistenceMapper {
  public persistenceToDomain(row: ClassTableSelect): Class {
    return Class.reconstitute({
      id: row.id,
      title: row.title,
      description: row.description,
      images: row.images,
      durationInMins: row.duration_in_mins,
      seats: row.seats,
      cost: row.cost,
      isHiddenFromBookingPage: row.is_hidden_from_booking_page,
      businessId: row.business_id,
      ...persistenceAuditToDomain(row),
    });
  }

  public domainToPersistence(cls: Class): ClassTableInsert {
    return {
      id: cls.id,
      title: cls.title,
      description: cls.description,
      images: cls.images,
      duration_in_mins: cls.durationInMins,
      seats: cls.seats,
      cost: cls.cost,
      is_hidden_from_booking_page: cls.isHiddenFromBookingPage,
      business_id: cls.businessId,
      ...domainAuditToPersistence(cls),
    };
  }
}
