import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface Credits {
  credits: number;
}

interface CreditsState {
  credits: Credits;
  setCredits: (credits: Credits) => void;
}

export const useCredits = create<CreditsState>()(
  persist(
    (set) => ({
      credits: {
        credits: 0,
      },
      setCredits: (credits: Credits) => {
        set({ credits });
      },
    }),
    {
      name: "credits-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
