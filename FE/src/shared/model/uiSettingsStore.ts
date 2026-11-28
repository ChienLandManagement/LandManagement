import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UiPrimaryColor = 'teal' | 'blue' | 'indigo' | 'violet' | 'green' | 'orange';
export type UiRadius = 'xs' | 'sm' | 'md' | 'lg';

interface UiSettingsState {
  primaryColor: UiPrimaryColor;
  defaultRadius: UiRadius;
  setPrimaryColor: (color: UiPrimaryColor) => void;
  setDefaultRadius: (radius: UiRadius) => void;
  reset: () => void;
}

const DEFAULT_SETTINGS = {
  primaryColor: 'teal' as UiPrimaryColor,
  defaultRadius: 'md' as UiRadius,
};

export const useUiSettingsStore = create<UiSettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setPrimaryColor: (primaryColor) => set({ primaryColor }),
      setDefaultRadius: (defaultRadius) => set({ defaultRadius }),
      reset: () => set(DEFAULT_SETTINGS),
    }),
    { name: 'lm-ui-settings' },
  ),
);
