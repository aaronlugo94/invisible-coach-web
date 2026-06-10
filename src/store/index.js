import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set) => ({
      user: null,
      onboardingDone: false,
      setUser:           (u)  => set({ user: u }),
      updateUser:        (kw) => set(s => ({ user: { ...s.user, ...kw } })),
      setOnboardingDone: ()   => set({ onboardingDone: true }),
      clear:             ()   => set({ user: null, onboardingDone: false }),
    }),
    { name: 'ic-store' }
  )
)
