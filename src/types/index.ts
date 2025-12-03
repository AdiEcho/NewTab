export interface Site {
  id: string;
  name: string;
  url: string;
  icon?: string;
  groupId: string;
}

export interface SiteGroup {
  id: string;
  name: string;
  order: number;
}

export interface SearchEngine {
  id: string;
  name: string;
  url: string;
  icon: string;
  isCustom?: boolean;
}

export interface HitokotoData {
  id: number;
  hitokoto: string;
  type: string;
  from: string;
  from_who: string | null;
  creator: string;
}

export type HitokotoType = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l';

export const HITOKOTO_TYPES: Record<HitokotoType, string> = {
  a: '动画',
  b: '漫画',
  c: '游戏',
  d: '文学',
  e: '原创',
  f: '来自网络',
  g: '其他',
  h: '影视',
  i: '诗词',
  j: '网易云',
  k: '哲学',
  l: '抖机灵',
};

export interface WeatherData {
  city: string;
  temp: number;
  weather: string;
  icon: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type WallpaperSource = 'bing' | 'local' | 'color';

export interface WallpaperConfig {
  source: WallpaperSource;
  url?: string;
  color?: string;
  blur?: number;
}

export interface WebDAVConfig {
  url: string;
  username: string;
  password: string;
  autoSync: boolean;
}

export type CardSize = 'small' | 'medium' | 'large';

export type AddButtonPosition = 'card' | 'corner' | 'both';

export interface Settings {
  theme: ThemeMode;
  themeColor: string;
  wallpaper: WallpaperConfig;
  cardRadius: number;
  cardOpacity: number;
  cardGlassEffect: boolean;
  cardBlur: number;
  cardSize: CardSize;
  addButtonPosition: AddButtonPosition;
  showRandomWallpaperBtn: boolean;
  showWeather: boolean;
  weatherCity: string;
  showTodo: boolean;
  showNotes: boolean;
  hitokotoTypes: HitokotoType[];
  searchEngine: string;
  customSearchEngines: SearchEngine[];
  webdav: WebDAVConfig;
}

export interface AppState {
  sites: Site[];
  groups: SiteGroup[];
  settings: Settings;
  searchHistory: string[];
}

export const DEFAULT_SEARCH_ENGINES: SearchEngine[] = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=', icon: 'https://www.google.com/favicon.ico' },
  { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=', icon: 'https://www.bing.com/favicon.ico' },
  { id: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd=', icon: 'https://www.baidu.com/favicon.ico' },
  { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', icon: 'https://duckduckgo.com/favicon.ico' },
];

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  themeColor: '#14b8a6',
  wallpaper: {
    source: 'bing',
    blur: 0,
  },
  cardRadius: 12,
  cardOpacity: 0.8,
  cardGlassEffect: false,
  cardBlur: 10,
  cardSize: 'medium',
  addButtonPosition: 'both',
  showRandomWallpaperBtn: true,
  showWeather: true,
  weatherCity: '',
  showTodo: false,
  showNotes: false,
  hitokotoTypes: ['a', 'd', 'i', 'k'],
  searchEngine: 'google',
  customSearchEngines: [],
  webdav: {
    url: '',
    username: '',
    password: '',
    autoSync: false,
  },
};

export const DEFAULT_GROUPS: SiteGroup[] = [
  { id: 'all', name: '全部', order: 0 },
  { id: 'default', name: '默认', order: 1 },
];
