// ============================================================
// HEAR ME — Types matching
// ============================================================

import { PublicUserProfile } from './user.types'

export type LikeType = 'like' | 'superlike' | 'pass'

export interface Like {
  id: string
  from_user_id: string
  to_user_id: string
  type: LikeType
  created_at: string
}

export interface Match {
  id: string
  user1_id: string
  user2_id: string
  // Breakdown musical
  common_songs: number
  common_artists: number
  common_styles: number
  compatibility_score: number   // 0–100
  // Chargé à la demande
  other_user?: PublicUserProfile
  created_at: string
}

export interface CompatibilityBreakdown {
  score: number
  common_songs: string[]       // titres en commun
  common_artists: string[]     // artistes en commun
  common_styles: string[]      // styles en commun
}
