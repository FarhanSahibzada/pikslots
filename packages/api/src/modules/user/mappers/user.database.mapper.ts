import { User } from '@pikslots/domain';
import {
  domainAuditToPersistence,
  persistenceAuditToDomain,
} from 'src/shared/database/mapper/audit.fields.mapper';
import {
  UserTableInsert,
  UserTableSelect,
} from 'src/shared/database/schema/user.table';

export class UserPersistenceMapper {
  public persistenceToDomain(row: UserTableSelect): User {
    return User.reconstitute({
      id: row.id,
      username: row.username,
      password: row.password,
      name: { firstName: row.first_name, lastName: row.last_name },
      email: row.email,
      phone: row.phone,
      role: row.role,
      status: row.status,
      avatarUrl: row.avatar_url,
      emailVerified: row.email_verified,
      bookingUrl: row.booking_url,
      appointmentReminders: {
        reminderEnabled: row.reminder_enabled,
        reminderMinutesBefore: row.reminder_mins_before,
        reminderSoundType: row.reminder_sound_type,
      },
      notificationPreferences: {
        notificationMode: row.notification_mode,
        soundEnabled: row.notification_sound_enabled,
        soundType: row.notification_sound_type,
      },
      lastLoginAt: row.last_login_at,
      suspendedReason: row.suspended_reason,
      ...persistenceAuditToDomain(row),
    });
  }
  public domainToPersistence(user: User): UserTableInsert {
    return {
      id: user.id,
      username: user.username,
      password: user.password,
      first_name: user.name.firstName,
      last_name: user.name.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      avatar_url: user.avatarUrl,
      email_verified: user.emailVerified,
      booking_url: user.bookingUrl,
      notification_mode: user.notificationPreferences.notificationMode,
      notification_sound_enabled: user.notificationPreferences.soundEnabled,
      notification_sound_type: user.notificationPreferences.soundType,
      reminder_enabled: user.appointmentReminders.reminderEnabled,
      reminder_mins_before: user.appointmentReminders.reminderMinutesBefore,
      reminder_sound_type: user.appointmentReminders.reminderSoundType,
      last_login_at: user.lastLoginAt,
      suspended_reason: user.suspendedReason,
      ...domainAuditToPersistence(user),
    };
  }
}
