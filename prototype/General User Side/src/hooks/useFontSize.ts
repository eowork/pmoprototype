import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Font size presets matching CSU website standards
export type FontSizePreset = 'small' | 'medium' | 'large' | 'extra-large';

interface FontSizeState {
  fontSize: FontSizePreset;
  fontSizeValue: number; // Base font size in px
  setFontSize: (size: FontSizePreset) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
}

// Font size mappings (in pixels) - Increased for better readability
const FONT_SIZE_MAP: Record<FontSizePreset, number> = {
  small: 15,
  medium: 16, // Default
  large: 18,
  'extra-large': 20, // Very large option
};

// Create the font size store with persistence
export const useFontSize = create<FontSizeState>()(
  persist(
    (set, get) => ({
      fontSize: 'medium',
      fontSizeValue: FONT_SIZE_MAP.medium,

      setFontSize: (size: FontSizePreset) => {
        const fontSizeValue = FONT_SIZE_MAP[size];
        // Calculate scale factor (medium is 1.0)
        const scale = fontSizeValue / FONT_SIZE_MAP.medium;
        // Update CSS custom properties
        document.documentElement.style.setProperty('--font-size', `${fontSizeValue}px`);
        document.documentElement.style.setProperty('--font-size-scale', scale.toString());
        set({ fontSize: size, fontSizeValue });
      },

      increaseFontSize: () => {
        const current = get().fontSize;
        if (current === 'small') {
          get().setFontSize('medium');
        } else if (current === 'medium') {
          get().setFontSize('large');
        } else if (current === 'large') {
          get().setFontSize('extra-large');
        }
      },

      decreaseFontSize: () => {
        const current = get().fontSize;
        if (current === 'extra-large') {
          get().setFontSize('large');
        } else if (current === 'large') {
          get().setFontSize('medium');
        } else if (current === 'medium') {
          get().setFontSize('small');
        }
      },

      resetFontSize: () => {
        get().setFontSize('medium');
      },
    }),
    {
      name: 'csu-pmo-font-size', // localStorage key
    }
  )
);

// Initialize font size on app load
export const initializeFontSize = () => {
  const state = useFontSize.getState();
  const scale = state.fontSizeValue / FONT_SIZE_MAP.medium;
  document.documentElement.style.setProperty('--font-size', `${state.fontSizeValue}px`);
  document.documentElement.style.setProperty('--font-size-scale', scale.toString());
};