// ============================================================
// HEAR ME — Types utilisateur
// ============================================================

export type Gender =
  | 'homme'
  | 'femme'
  | 'iel'
  | 'trans'
  | 'non-binaire'
  | 'autre'

export type ConnectionType = 'amour' | 'amitié' | 'les deux'

export type SubscriptionPlan = 'free' | 'platinum' | 'diamond'

export type AccountStatus =
  | 'active'
  | 'paused'
  | 'suspended'
  | 'banned'
  | 'deleted'

export type ModerationStatus = 'approved' | 'pending' | 'rejected'

export interface UserPhoto {
  id: string
  url: string
  position: number // 0–8
  moderation_status: ModerationStatus
}

export interface MusicProfile {
  styles: [string, string]          // 2 styles exactement
  artists: [string, string, string] // 3 artistes exactement
  songs: Song[]                     // 5 chansons exactement
}

export interface Song {
  itunes_track_id: number
  title: string
  artist: string
  album: string
  album_cover_url: string
  preview_url: string | null
}

export interface UserPreferences {
  connection_type: ConnectionType
  // Préférences pour l'amour
  love_gender: Gender[]
  love_age_min: number
  love_age_max: number
  love_max_distance_km: number
  // Préférences pour l'amitié
  friendship_gender: Gender[]
  friendship_age_min: number
  friendship_age_max: number
  friendship_max_distance_km: number
}

export interface User {
  id: string
  first_name: string
  last_name: string
  phone_number: string
  birth_date: string      // ISO 8601
  age: number             // calculé
  gender: Gender
  city: string
  latitude?: number
  longitude?: number
  bio?: string
  photos: UserPhoto[]
  music: MusicProfile
  preferences: UserPreferences
  subscription: SubscriptionPlan
  subscription_expires_at?: string
  account_status: AccountStatus
  is_certified: boolean
  new_user_boost_expires_at?: string // boost 2x visibilité 1ère semaine
  created_at: string
  updated_at: string
}

// Profil public (vu par les autres utilisateurs)
export type PublicUserProfile = Pick<
  User,
  | 'id'
  | 'first_name'
  | 'age'
  | 'gender'
  | 'city'
  | 'bio'
  | 'photos'
  | 'music'
  | 'is_certified'
>
