// ============================================================
// HEAR ME — Store Auth (Zustand)
// ============================================================

import { create } from 'zustand'
import { User } from '@/types/user.types'

type AuthStatus = 'loading' | 'unauthenticated' | 'onboarding' | 'authenticated'
type AuthMode   = 'register' | 'login'

interface AuthStore {
  status: AuthStatus
  mode:   AuthMode
  user:   User | null
  phone:  string | null

  setStatus: (status: AuthStatus) => void
  setMode:   (mode: AuthMode) => void
  setUser:   (user: User | null) => void
  setPhone:  (phone: string) => void
  logout:    () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  status: 'loading',
  mode:   'register',
  user:   null,
  phone:  null,

  setStatus: (status) => set({ status }),
  setMode:   (mode)   => set({ mode }),
  setUser:   (user)   => set({ user }),
  setPhone:  (phone)  => set({ phone }),
  logout:    () => set({ status: 'unauthenticated', mode: 'register', user: null, phone: null }),
}))
