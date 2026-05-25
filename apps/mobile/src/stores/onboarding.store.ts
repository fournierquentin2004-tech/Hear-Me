// ============================================================
// HEAR ME — Store Onboarding (Zustand)
// ============================================================

import { create } from 'zustand'
import { Gender, ConnectionType } from '@/types/user.types'
import { Song } from '@/types/user.types'

interface OnboardingStore {
  // Étape 1 — Profil
  firstName: string
  lastName: string
  birthDate: string
  gender: Gender | null
  city: string
  latitude: number | null
  longitude: number | null

  // Étape 2 — Musique
  styles: [string, string] | []
  artists: [string, string, string] | []
  songs: Song[]

  // Étape 3 — Type de connexion
  connectionType: ConnectionType | null

  // Étape 4 — Préférences
  loveGender: Gender[]
  loveAgeMin: number
  loveAgeMax: number
  loveMaxDistanceKm: number
  friendshipGender: Gender[]
  friendshipAgeMin: number
  friendshipAgeMax: number
  friendshipMaxDistanceKm: number

  // Étape 5 — Photos
  photos: string[]

  // Actions
  setProfile: (data: Partial<Pick<OnboardingStore, 'firstName' | 'lastName' | 'birthDate' | 'gender' | 'city' | 'latitude' | 'longitude'>>) => void
  setMusic: (data: Partial<Pick<OnboardingStore, 'styles' | 'artists' | 'songs'>>) => void
  setConnectionType: (type: ConnectionType) => void
  setPreferences: (data: Partial<Pick<OnboardingStore, 'loveGender' | 'loveAgeMin' | 'loveAgeMax' | 'loveMaxDistanceKm' | 'friendshipGender' | 'friendshipAgeMin' | 'friendshipAgeMax' | 'friendshipMaxDistanceKm'>>) => void
  addPhoto: (uri: string) => void
  removePhoto: (uri: string) => void
  reset: () => void
}

const initialState = {
  firstName: '',
  lastName: '',
  birthDate: '',
  gender: null,
  city: '',
  latitude: null,
  longitude: null,
  styles: [] as [],
  artists: [] as [],
  songs: [],
  connectionType: null,
  loveGender: [],
  loveAgeMin: 18,
  loveAgeMax: 35,
  loveMaxDistanceKm: 50,
  friendshipGender: [],
  friendshipAgeMin: 18,
  friendshipAgeMax: 35,
  friendshipMaxDistanceKm: 50,
  photos: [],
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  ...initialState,

  setProfile: (data) => set((s) => ({ ...s, ...data })),
  setMusic: (data) => set((s) => ({ ...s, ...data })),
  setConnectionType: (connectionType) => set({ connectionType }),
  setPreferences: (data) => set((s) => ({ ...s, ...data })),
  addPhoto: (uri) => set((s) => ({ photos: [...s.photos, uri] })),
  removePhoto: (uri) => set((s) => ({ photos: s.photos.filter((p) => p !== uri) })),
  reset: () => set(initialState),
}))
