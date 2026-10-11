export interface Slot {
  startTime: string; // ISO 8601 UTC, e.g. "2025-06-16T09:00:00.000Z"
  endTime: string; // ISO 8601 UTC, e.g. "2025-06-16T09:30:00.000Z"
}

export interface UserBreak {
  day: WeekDay;
  startTime: string; // ISO 8601 UTC, e.g. "2025-06-16T09:00:00.000Z"
  endTime: string; // ISO 8601 UTC, e.g. "2025-06-16T09:30:00.000Z"
}

export interface DayHours {
  enabled: boolean;
  openTime: string; // 'HH:mm' 24-hour, e.g. '09:00'
  closeTime: string; // 'HH:mm' 24-hour, e.g. '17:00'
}

export interface ShedulingWindow {
  unit: TimeUnit;
  value: number;
}

export interface FullName {
  readonly firstName: string;
  readonly lastName: string;
}

type TimeUnit = 'minutes' | 'hours' | 'days' | 'weeks' | 'months';

export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type SocialPlatforms =
  | 'Website'
  | 'Instagram'
  | 'Facebook'
  | 'Tiktok'
  | 'X'
  | 'Youtube'
  | 'LinkedIn';

export interface ServiceSummary {
  id: string;
  title: string;
  durationInMins: number;
  bufferTimeInMins: number;
  cost: number;
  colorCode: string;
}

export interface ClassSummary {
  id: string;
  title: string;
}
