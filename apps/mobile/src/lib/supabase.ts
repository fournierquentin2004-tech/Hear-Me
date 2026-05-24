// ============================================================
// HEAR ME — Client Supabase
// Base de données, Auth, Realtime (chat), Storage (photos)
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Variables EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY manquantes dans .env.local'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Stockage persistant avec AsyncStorage (React Native)
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Désactivé en React Native (pas de browser)
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Limite pour éviter le throttling
    },
  },
})
