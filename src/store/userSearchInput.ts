import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserSearchInputState {
  userSearchInput: {
    text: string;
    fileId: string;
    fileType: string;
    fileName: string;
    fileSize: number;
  };
  setUserSearchInput: (userSearchInput: {
    text: string;
    fileId: string;
    fileType: string;
    fileName: string;
    fileSize: number;
  }) => void;
}

export const useUserSearchInput = create<UserSearchInputState>()(
  persist(
    (set) => ({
      userSearchInput: {
        text: "",
        fileId: "",
        fileType: "",
        fileName: "",
        fileSize: 0,
      },
      setUserSearchInput: (userSearchInput: {
        text: string;
        fileId: string;
        fileType: string;
        fileName: string;
        fileSize: number;
      }) => {
        set({ userSearchInput });
      },
    }),
    {
      name: "user-search-input-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
