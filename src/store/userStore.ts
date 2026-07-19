import { create } from 'zustand'
import type { UserProfile, Language, RoutePreferences } from '@/types'

interface UserState {
  user: UserProfile | null
  isLoading: boolean
  setUser: (user: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  updatePreferences: (prefs: Partial<RoutePreferences>) => void
  setLanguage: (lang: Language) => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  updatePreferences: (prefs) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, routePreferences: { ...state.user.routePreferences, ...prefs } }
        : null,
    })),
  setLanguage: (lang) =>
    set((state) => ({
      user: state.user ? { ...state.user, preferredLanguage: lang } : null,
    })),
}))
