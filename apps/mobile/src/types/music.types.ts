// ============================================================
// HEAR ME — Types musique (iTunes Search API)
// ============================================================

// Résultat brut de l'iTunes Search API
export interface ItunesTrack {
  trackId: number
  trackName: string
  artistName: string
  collectionName: string
  artworkUrl100: string
  previewUrl?: string
  primaryGenreName: string
  releaseDate: string
  trackTimeMillis?: number
}

export interface ItunesArtist {
  artistId: number
  artistName: string
  primaryGenreName: string
  artistLinkUrl?: string
}

export interface ItunesSearchResponse {
  resultCount: number
  results: (ItunesTrack | ItunesArtist)[]
}

// Artiste tendance sur l'app (calculé côté Supabase)
export interface TrendingArtist {
  rank: number             // 1–10
  artist_name: string
  count: number            // nombre d'utilisateurs qui l'ont
  updated_at: string       // mis à jour toutes les 24h
}
