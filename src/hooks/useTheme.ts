import { useEffect } from 'react';
import { useStore } from '@/stores/useStore';
import type { ThemeMode } from '@/types';

export function useTheme() {
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);

  useEffect(() => {
    const applyTheme = (mode: ThemeMode) => {
      const isDark =
        mode === 'dark' ||
        (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      document.documentElement.classList.toggle('dark', isDark);
    };

    applyTheme(settings.theme);

    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [settings.theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--theme-color', settings.themeColor);
  }, [settings.themeColor]);

  const setTheme = (mode: ThemeMode) => updateSettings({ theme: mode });
  const setThemeColor = (color: string) => updateSettings({ themeColor: color });

  return { theme: settings.theme, themeColor: settings.themeColor, setTheme, setThemeColor };
}
