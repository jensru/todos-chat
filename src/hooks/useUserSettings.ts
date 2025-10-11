// src/hooks/useUserSettings.ts - User Settings Management
'use client';

import { useState, useEffect } from 'react';

export interface UserSettings {
  speechLanguage: string;
  uiLanguage: string;
  theme: 'light' | 'dark' | 'system';
}

const DEFAULT_SETTINGS: UserSettings = {
  speechLanguage: 'en-US',
  uiLanguage: 'en',
  theme: 'system'
};

export function useUserSettings(): {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
  isReady: boolean;
} {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isReady, setIsReady] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('user-settings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        } catch (error) {
          console.error('Error parsing user settings:', error);
          setSettings(DEFAULT_SETTINGS);
        }
      }
      setIsReady(true);
    }
  }, []);

  // Save settings to localStorage whenever settings change
  useEffect(() => {
    if (typeof window !== 'undefined' && isReady) {
      localStorage.setItem('user-settings', JSON.stringify(settings));
    }
  }, [settings, isReady]);

  const updateSettings = (updates: Partial<UserSettings>): void => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return {
    settings,
    updateSettings,
    isReady
  };
}
