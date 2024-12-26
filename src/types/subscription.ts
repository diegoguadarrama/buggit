export type SubscriptionTier = 'free' | 'pro' | 'unleashed';

export interface Subscription {
  id: string;
  profile_id: string;
  tier: SubscriptionTier;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}