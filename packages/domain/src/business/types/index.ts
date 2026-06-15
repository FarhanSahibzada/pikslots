export type BusinessStatus = 'pending_setup' | 'active' | 'inactive' | 'suspended';
export type TimeUnit = 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
export type NotificationType = 'email' | 'sms';

export type BusinessIndustry =
  | 'salon_and_beauty'
  | 'health_and_wellness'
  | 'fitness'
  | 'medical'
  | 'education'
  | 'legal'
  | 'financial'
  | 'hospitality'
  | 'retail'
  | 'other';

export type SubscriptionPlan = 'free' | 'starter' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'cancelled';
export type BrandButtonShape = 'pill' | 'rounded' | 'rectangle';
export type BrandTheme = 'system' | 'light' | 'dark';
export type SupportedCurrencies = 'USD' | 'PKR' | 'RUB';
