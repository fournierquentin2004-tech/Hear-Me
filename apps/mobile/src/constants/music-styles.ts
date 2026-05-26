// ============================================================
// HEAR ME — Styles musicaux (12 plus écoutés)
// ============================================================

export const MUSIC_STYLES = [
  'Pop',
  'Hip-Hop',
  'Rap',
  'R&B',
  'Électro',
  'Rock',
  'Variété française',
  'Afrobeats',
  'Reggaeton',
  'House',
  'Metal',
  'K-Pop',
] as const

export type MusicStyle = (typeof MUSIC_STYLES)[number]
