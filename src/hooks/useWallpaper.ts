import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/stores/useStore';
import { fetchBingWallpaper } from '@/utils/api';

const WALLPAPER_CACHE_KEY = 'wallpaper_cache';

export function useWallpaper() {
  const settings = useStore((state) => state.settings);
  const [wallpaperUrl, setWallpaperUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const loadWallpaper = useCallback(async (forceRefresh = false) => {
    const { wallpaper } = settings;

    if (wallpaper.source === 'color') {
      setWallpaperUrl('');
      return;
    }

    if (wallpaper.source === 'local' && wallpaper.url) {
      setWallpaperUrl(wallpaper.url);
      return;
    }

    const cached = localStorage.getItem(WALLPAPER_CACHE_KEY);
    if (cached && !forceRefresh) {
      const { url, source, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > 1000 * 60 * 60 * 24;
      if (source === wallpaper.source && !isExpired) {
        setWallpaperUrl(url);
        return;
      }
    }

    setLoading(true);
    try {
      let url = '';
      if (wallpaper.source === 'bing') {
        url = await fetchBingWallpaper();
      }

      if (url) {
        setWallpaperUrl(url);
        localStorage.setItem(
          WALLPAPER_CACHE_KEY,
          JSON.stringify({ url, source: wallpaper.source, timestamp: Date.now() })
        );
      }
    } finally {
      setLoading(false);
    }
  }, [settings]);

  useEffect(() => {
    loadWallpaper();
  }, [loadWallpaper]);

  const refreshWallpaper = () => loadWallpaper(true);

  return { wallpaperUrl, loading, refreshWallpaper };
}
