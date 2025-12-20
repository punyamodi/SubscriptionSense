import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { makeKV } from './storage';

// Supported currencies
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
] as const;

// Supported languages
export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
] as const;

export type CurrencyCode = typeof CURRENCIES[number]['code'];
export type LanguageCode = typeof LANGUAGES[number]['code'];

interface PreferencesState {
  currency: CurrencyCode;
  language: LanguageCode;
  notifications: boolean;
  darkMode: boolean;
  hasCompletedTutorial: boolean;
  
  // Actions
  setCurrency: (currency: CurrencyCode) => void;
  setLanguage: (language: LanguageCode) => void;
  setNotifications: (enabled: boolean) => void;
  setDarkMode: (enabled: boolean) => void;
  setHasCompletedTutorial: (completed: boolean) => void;
}

const kv = makeKV();

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      currency: 'USD',
      language: 'en',
      notifications: true,
      darkMode: true,
      hasCompletedTutorial: false,

      setCurrency: (currency) => set({ currency }),
      setLanguage: (language) => set({ language }),
      setNotifications: (notifications) => set({ notifications }),
      setDarkMode: (darkMode) => set({ darkMode }),
      setHasCompletedTutorial: (hasCompletedTutorial) => set({ hasCompletedTutorial }),
    }),
    {
      name: 'preferences-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => kv.getItem(name),
        setItem: (name, value) => kv.setItem(name, value),
        removeItem: (name) => kv.removeItem(name),
      })),
    }
  )
);
