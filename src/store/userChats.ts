import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserChatsState {
  userChats: any[];
  setUserChats: (userChats: any[]) => void;
}

export const useUserChats = create<UserChatsState>()(
  persist(
    (set, get) => ({
      userChats: [],
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
