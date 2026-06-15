export interface DayHours {
  enabled: boolean;
  openTime: string; // 'HH:mm' 24-hour, e.g. '09:00'
  closeTime: string; // 'HH:mm' 24-hour, e.g. '17:00'
}

export interface FullName {
  readonly firstName: string;
  readonly lastName: string;
}

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
}

export interface ClassSummary {
  id: string;
  title: string;
}
