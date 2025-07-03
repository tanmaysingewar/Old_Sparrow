import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface DisplaySetting {
  hideInputArea: boolean;
}

interface DisplaySettingState {
  displaySetting: DisplaySetting;
  setDisplaySetting: (displaySetting: DisplaySetting) => void;
}

export const useDisplaySetting = create<DisplaySettingState>()(
  persist(
    (set) => ({
      displaySetting: {
        hideInputArea: false,
      },
      setDisplaySetting: (displaySetting: DisplaySetting) => {
        set({ displaySetting });
      },
    }),
    {
      name: "display-setting-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
