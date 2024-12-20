import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PrivacyStore {
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
  setPrivacyMode: (value: boolean) => void;
}

export const usePrivacyStore = create<PrivacyStore>()(
  persist(
    (set) => ({
      isPrivacyMode: false,
      togglePrivacyMode: () => {
        set((state) => {
          const newValue = !state.isPrivacyMode;
          if (typeof window !== 'undefined') {
            if (newValue) {
              window.location.href = '/no-js/index.html';
            } else {
              window.location.href = '/';
            }
          }
          return { isPrivacyMode: newValue };
        });
      },
      setPrivacyMode: (value: boolean) => set({ isPrivacyMode: value }),
    }),
    {
      name: 'privacy-settings',
    }
  )
);