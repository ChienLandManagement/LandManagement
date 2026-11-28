import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UiPrimaryColor = 'teal' | 'blue' | 'indigo' | 'violet' | 'green' | 'orange';
export type UiRadius = 'xs' | 'sm' | 'md' | 'lg';
export type UiMainBg = 'default' | 'gray' | 'cool' | 'warm';

interface UiSettingsState {
  primaryColor: UiPrimaryColor;
  defaultRadius: UiRadius;
  tableColumnBorders: boolean;
  mainBg: UiMainBg;
  setPrimaryColor: (color: UiPrimaryColor) => void;
  setDefaultRadius: (radius: UiRadius) => void;
  setTableColumnBorders: (enabled: boolean) => void;
  setMainBg: (bg: UiMainBg) => void;
  reset: () => void;
}

const DEFAULT_SETTINGS = {
  primaryColor: 'teal' as UiPrimaryColor,
  defaultRadius: 'md' as UiRadius,
  tableColumnBorders: true,
  mainBg: 'gray' as UiMainBg,
};

export const useUiSettingsStore = create<UiSettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setPrimaryColor: (primaryColor) => set({ primaryColor }),
      setDefaultRadius: (defaultRadius) => set({ defaultRadius }),
      setTableColumnBorders: (tableColumnBorders) => set({ tableColumnBorders }),
      setMainBg: (mainBg) => set({ mainBg }),
      reset: () => set(DEFAULT_SETTINGS),
    }),
    { name: 'lm-ui-settings' },
  ),
);
