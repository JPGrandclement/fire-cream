import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LoveQuestState {
  readLetters: string[];
  markLetterAsRead: (id: string) => void;
  dailyMessageCache: { date: string; text: string } | null;
  setDailyMessageCache: (cache: { date: string; text: string }) => void;
  isVaultUnlocked: boolean;
  unlockVault: () => void;
  showGift: boolean;
  setShowGift: (show: boolean) => void;
  resetRadarQuest: () => void;
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
      showGift: false,
      setShowGift: (show: boolean) => set({ showGift: show }),
      resetRadarQuest: () => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('radar_gift_unlocked_v1');
        }
        set({ showGift: false });
      },
    }),
    {
      name: 'love-quest-storage',
    }
  )
);
