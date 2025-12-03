import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Site, SiteGroup, Settings, SearchEngine } from '@/types';
import { DEFAULT_SETTINGS, DEFAULT_GROUPS } from '@/types';

interface Store {
  sites: Site[];
  groups: SiteGroup[];
  settings: Settings;
  searchHistory: string[];
  activeGroup: string;

  addSite: (site: Omit<Site, 'id'>) => void;
  updateSite: (id: string, site: Partial<Site>) => void;
  deleteSite: (id: string) => void;
  reorderSites: (sites: Site[]) => void;

  addGroup: (name: string) => void;
  updateGroup: (id: string, name: string) => void;
  deleteGroup: (id: string) => void;
  setActiveGroup: (id: string) => void;

  updateSettings: (settings: Partial<Settings>) => void;
  addSearchEngine: (engine: Omit<SearchEngine, 'id' | 'isCustom'>) => void;
  removeSearchEngine: (id: string) => void;

  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;

  importData: (data: { sites: Site[]; groups: SiteGroup[]; settings: Settings }) => void;
  exportData: () => { sites: Site[]; groups: SiteGroup[]; settings: Settings };
  resetSettings: () => void;
  resetAll: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      sites: [],
      groups: DEFAULT_GROUPS,
      settings: DEFAULT_SETTINGS,
      searchHistory: [],
      activeGroup: 'all',

      addSite: (site) =>
        set((state) => ({
          sites: [...state.sites, { ...site, id: generateId() }],
        })),

      updateSite: (id, updates) =>
        set((state) => ({
          sites: state.sites.map((site) =>
            site.id === id ? { ...site, ...updates } : site
          ),
        })),

      deleteSite: (id) =>
        set((state) => ({
          sites: state.sites.filter((site) => site.id !== id),
        })),

      reorderSites: (sites) => set({ sites }),

      addGroup: (name) =>
        set((state) => ({
          groups: [
            ...state.groups,
            { id: generateId(), name, order: state.groups.length },
          ],
        })),

      updateGroup: (id, name) =>
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === id ? { ...group, name } : group
          ),
        })),

      deleteGroup: (id) =>
        set((state) => ({
          groups: state.groups.filter((group) => group.id !== id && group.id !== 'all' && group.id !== 'default'),
          sites: state.sites.map((site) =>
            site.groupId === id ? { ...site, groupId: 'default' } : site
          ),
        })),

      setActiveGroup: (id) => set({ activeGroup: id }),

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      addSearchEngine: (engine) =>
        set((state) => ({
          settings: {
            ...state.settings,
            customSearchEngines: [
              ...state.settings.customSearchEngines,
              { ...engine, id: generateId(), isCustom: true },
            ],
          },
        })),

      removeSearchEngine: (id) =>
        set((state) => ({
          settings: {
            ...state.settings,
            customSearchEngines: state.settings.customSearchEngines.filter(
              (e) => e.id !== id
            ),
          },
        })),

      addSearchHistory: (query) =>
        set((state) => {
          const history = [query, ...state.searchHistory.filter((q) => q !== query)].slice(0, 20);
          return { searchHistory: history };
        }),

      clearSearchHistory: () => set({ searchHistory: [] }),

      importData: (data) =>
        set({
          sites: data.sites,
          groups: data.groups,
          settings: { ...DEFAULT_SETTINGS, ...data.settings },
        }),

      exportData: () => {
        const { sites, groups, settings } = get();
        return { sites, groups, settings };
      },

      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),

      resetAll: () => set({
        sites: [],
        groups: DEFAULT_GROUPS,
        settings: DEFAULT_SETTINGS,
        searchHistory: [],
        activeGroup: 'all',
      }),
    }),
    {
      name: 'newtab-storage',
    }
  )
);
