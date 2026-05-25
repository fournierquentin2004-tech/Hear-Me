// ============================================================
// HEAR ME — Store Auth (Zustand)
// ============================================================

import { create } from 'zustand'
import { User } from '@/types/user.types'

type AuthStatus = 'loading' | 'unauthenticated' | 'onboarding' | 'authenticated'

interface AuthStore {
  status: AuthStatus
  user: User | null
  phone: string | null

  setStatus: (status: AuthStatus) => void
  setUser: (user: User | null) => void
  setPhone: (phone: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  status: 'loading',
  user: null,
  phone: null,

  setStatus: (status) => set({ status }),
  setUser: (user) => set({ user }),
  setPhone: (phone) => set({ phone }),
  logout: () => set({ status: 'unauthenticated', user: null, phone: null }),
}))
