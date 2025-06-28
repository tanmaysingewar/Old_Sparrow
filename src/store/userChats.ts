import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserChatsState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userChats: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUserChats: (userChats: any[]) => void;
}

export const useUserChats = create<UserChatsState>()(
  persist(
    (set) => ({
      userChats: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setUserChats: (userChats: any[]) => {
        set({ userChats });
      },
    }),
    {
      name: "user-chats-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
