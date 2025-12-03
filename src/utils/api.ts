import type { HitokotoData, HitokotoType, WeatherData } from '@/types';

const HITOKOTO_CACHE_KEY = 'hitokoto_cache';
const HITOKOTO_CACHE_TIME = 1000 * 60 * 30;

export async function fetchHitokoto(types: HitokotoType[]): Promise<HitokotoData | null> {
  const cached = localStorage.getItem(HITOKOTO_CACHE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < HITOKOTO_CACHE_TIME) {
      return data;
    }
  }

  try {
    const typeParams = types.map((t) => `c=${t}`).join('&');
    const response = await fetch(`https://v1.hitokoto.cn/?${typeParams}`);
    const data: HitokotoData = await response.json();
    localStorage.setItem(HITOKOTO_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
    return data;
  } catch (error) {
    console.error('Failed to fetch hitokoto:', error);
    return null;
  }
}

export function clearHitokotoCache(): void {
  localStorage.removeItem(HITOKOTO_CACHE_KEY);
}

export async function fetchBingWallpaper(): Promise<string> {
  try {
    const response = await fetch('https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=8&mkt=zh-CN');
    const data = await response.json();
    const randomIndex = Math.floor(Math.random() * data.images.length);
    return `https://www.bing.com${data.images[randomIndex].url}`;
  } catch (error) {
    console.error('Failed to fetch Bing wallpaper:', error);
    return '';
  }
}



export async function fetchWeather(city?: string): Promise<WeatherData | null> {
  try {
    const location = city ? encodeURIComponent(city.trim()) : '';
    const response = await fetch(
      `https://wttr.in/${location}?format=j1`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.current_condition?.[0] || !data.nearest_area?.[0]) {
      throw new Error('Invalid weather data');
    }
    
    const current = data.current_condition[0];
    const area = data.nearest_area[0];
    
    const cityName = area.areaName?.[0]?.value || 
                     area.region?.[0]?.value || 
                     city || 
                     'Unknown';
    
    return {
      city: cityName,
      temp: parseInt(current.temp_C) || 0,
      weather: current.weatherDesc?.[0]?.value || '',
      icon: getWeatherIcon(current.weatherCode || ''),
    };
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    return null;
  }
}

function getWeatherIcon(code: string): string {
  const codeNum = parseInt(code);
  if (codeNum === 113) return '☀️';
  if (codeNum === 116) return '⛅';
  if ([119, 122].includes(codeNum)) return '☁️';
  if ([176, 263, 266, 293, 296, 299, 302, 305, 308, 311, 314, 353, 356, 359].includes(codeNum)) return '🌧️';
  if ([179, 182, 185, 281, 284, 317, 320, 323, 326, 329, 332, 335, 338, 350, 362, 365, 368, 371, 374, 377].includes(codeNum)) return '🌨️';
  if ([200, 386, 389, 392, 395].includes(codeNum)) return '⛈️';
  if ([143, 248, 260].includes(codeNum)) return '🌫️';
  return '🌤️';
}

export async function getFaviconUrl(url: string): Promise<string> {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return '';
  }
}

export interface WebDAVClient {
  test: () => Promise<boolean>;
  upload: (data: string) => Promise<boolean>;
  download: () => Promise<string | null>;
}

export function createWebDAVClient(url: string, username: string, password: string): WebDAVClient {
  const auth = btoa(`${username}:${password}`);
  const headers = {
    Authorization: `Basic ${auth}`,
    'Content-Type': 'application/json',
  };

  const filePath = `${url.replace(/\/$/, '')}/newtab-backup.json`;

  return {
    test: async () => {
      try {
        const response = await fetch(url, { method: 'PROPFIND', headers });
        return response.ok || response.status === 207;
      } catch {
        return false;
      }
    },
    upload: async (data: string) => {
      try {
        const response = await fetch(filePath, {
          method: 'PUT',
          headers,
          body: data,
        });
        return response.ok || response.status === 201 || response.status === 204;
      } catch {
        return false;
      }
    },
    download: async () => {
      try {
        const response = await fetch(filePath, { method: 'GET', headers });
        if (response.ok) {
          return await response.text();
        }
        return null;
      } catch {
        return null;
      }
    },
  };
}
