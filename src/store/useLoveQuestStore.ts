import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LoveQuestState {
  readLetters: string[];
  markLetterAsRead: (id: string) => void;
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
    }),
    {
      name: 'love-quest-storage',
    }
  )
);
