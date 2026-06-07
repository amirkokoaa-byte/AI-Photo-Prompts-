import { create } from 'zustand';
import { AppSettings, CustomUser, Prompt } from './types';

interface AppState {
  user: CustomUser | null;
  settings: AppSettings;
  darkMode: boolean;
  selectedPromptForDetails: Prompt | null;
  setSelectedPromptForDetails: (prompt: Prompt | null) => void;
  setUser: (user: CustomUser | null) => void;
  setSettings: (settings: AppSettings) => void;
  toggleDarkMode: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const defaultSettings: AppSettings = {
  appName: 'AI Photo Prompts Pro',
  menuTitle1: 'برومبت صور شخصيه',
  menuTitle2: 'برومبت صور تعليميه',
  menuTitle3: 'برومبت صور مناسبات',
  menuTitle4: 'برومبت حروف و اسماء',
  instapayLink: '',
  walletNumber: '',
  bannerImageUrl: '',
  whatsappNumber: '',
};

export const useStore = create<AppState>((set) => ({
  user: null,
  settings: defaultSettings,
  darkMode: false,
  selectedPromptForDetails: null,
  sidebarOpen: false,
  setSelectedPromptForDetails: (prompt) => set({ selectedPromptForDetails: prompt }),
  setUser: (user) => set({ user }),
  setSettings: (settings) => set({ settings }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
