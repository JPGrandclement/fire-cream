import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LoveQuestState {
  readLetters: string[];
  markLetterAsRead: (id: string) => void;
  dailyMessageCache: { date: string; text: string } | null;
  setDailyMessageCache: (cache: { date: string; text: string }) => void;
  isVaultUnlocked: boolean;
  unlockVault: () => void;
}

export const useLoveQuestStore = create<LoveQuestState>()(
  persist(
    (set) => ({
      readLetters: [],
      markLetterAsRead: (id: string) =>
        set((state) => ({
          readLetters: state.readLetters.includes(id)
            ? state.readLetters
            : [...state.readLetters, id],
        })),
      dailyMessageCache: null,
      setDailyMessageCache: (cache) => set({ dailyMessageCache: cache }),
      isVaultUnlocked: false,
      unlockVault: () => set({ isVaultUnlocked: true }),
    }),
    {
      name: 'love-quest-storage',
    }
  )
);
