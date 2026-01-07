import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  effectiveTheme: 'light' | 'dark';
  setTheme: (mode: ThemeMode) => void;
}

// Create the theme store with persistence
export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      effectiveTheme: 'light',

      setTheme: (mode: ThemeMode) => {
        let effectiveTheme: 'light' | 'dark' = 'light';

        if (mode === 'system') {
          // Check system preference
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          effectiveTheme = systemPrefersDark ? 'dark' : 'light';
        } else {
          effectiveTheme = mode;
        }

        // Apply theme to document
        const root = document.documentElement;
        if (effectiveTheme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }

        set({ mode, effectiveTheme });
      },
    }),
    {
      name: 'csu-pmo-theme', // localStorage key
    }
  )
);

// Initialize theme on app load
export const initializeTheme = () => {
  const state = useTheme.getState();
  state.setTheme(state.mode);

  // Listen for system theme changes if mode is 'system'
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleSystemThemeChange = () => {
    const currentState = useTheme.getState();
    if (currentState.mode === 'system') {
      currentState.setTheme('system');
    }
  };

  mediaQuery.addEventListener('change', handleSystemThemeChange);
};
