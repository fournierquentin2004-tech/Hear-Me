// ============================================================
// HEAR ME — Types abonnements
// ============================================================

import { SubscriptionPlan } from './user.types'

export interface PlanConfig {
  id: SubscriptionPlan
  name: string                   // "Disque d'Or", "Disque de Platine", "Disque de Diamant"
  price_monthly_cents: number    // 0, 2500, 5500
  likes_per_day: number          // 40, 80, 200
  superlikes_per_day: number     // 1, 3, 7
  boost_hours_per_week: number   // 2, 5, 24
  rewind_per_day: number | null  // null = illimité
  see_who_liked_per_day: number | null
  travel_mode: boolean
  show_ads: boolean
  event_swipes_per_day: number | null  // null = illimité
  duo_events_per_week: number | null
  free_trial_days: number | null       // 7, 5, null
}

export interface UserSubscription {
  id: string
  user_id: string
  plan: SubscriptionPlan
  stripe_subscription_id?: string
  stripe_customer_id?: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  trial_end?: string
  created_at: string
}

// Quotas journaliers utilisés (reset chaque jour à minuit)
export interface DailyQuota {
  user_id: string
  date: string           // YYYY-MM-DD
  likes_used: number
  superlikes_used: number
  rewinds_used: number
  see_who_liked_used: number
  event_swipes_used: number
}
