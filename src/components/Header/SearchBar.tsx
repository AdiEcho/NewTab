import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, X, Clock, Trash2 } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { DEFAULT_SEARCH_ENGINES } from '@/types';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [showEngines, setShowEngines] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const settings = useStore((state) => state.settings);
  const searchHistory = useStore((state) => state.searchHistory);
  const addSearchHistory = useStore((state) => state.addSearchHistory);
  const clearSearchHistory = useStore((state) => state.clearSearchHistory);

  const allEngines = [...DEFAULT_SEARCH_ENGINES, ...settings.customSearchEngines];
  const currentEngine = allEngines.find((e) => e.id === settings.searchEngine) || DEFAULT_SEARCH_ENGINES[0];

  const filteredHistory = query
    ? searchHistory.filter((h) => h.toLowerCase().includes(query.toLowerCase()))
    : searchHistory;

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowEngines(false);
        setShowHistory(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    addSearchHistory(q.trim());
    window.location.href = currentEngine.url + encodeURIComponent(q.trim());
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (highlightIndex >= 0 && filteredHistory[highlightIndex]) {
        handleSearch(filteredHistory[highlightIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, filteredHistory.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Escape') {
      setShowHistory(false);
      setHighlightIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-full border border-white/30 dark:border-white/10 overflow-hidden"
      >
        <button
          onClick={() => setShowEngines(!showEngines)}
          className="flex items-center gap-1 px-4 py-3 hover:bg-white/10 transition-colors"
        >
          <img src={currentEngine.icon} alt="" className="w-4 h-4" />
          <ChevronDown className="w-3 h-3 text-white/70" />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowHistory(true);
            setHighlightIndex(-1);
          }}
          onFocus={() => setShowHistory(true)}
          onKeyDown={handleKeyDown}
          placeholder="搜索... (按 / 聚焦)"
          className="flex-1 bg-transparent px-2 py-3 text-white placeholder-white/50 outline-none"
        />

        {query && (
          <button
            onClick={() => setQuery('')}
            className="p-2 hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>
        )}

        <button
          onClick={() => handleSearch()}
          className="p-3 hover:bg-white/10 transition-colors"
        >
          <Search className="w-5 h-5 text-white/70" />
        </button>
      </motion.div>

      <AnimatePresence>
        {showEngines && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg shadow-lg overflow-hidden z-50"
          >
            {allEngines.map((engine) => (
              <button
                key={engine.id}
                onClick={() => {
                  useStore.getState().updateSettings({ searchEngine: engine.id });
                  setShowEngines(false);
                }}
                className={`flex items-center gap-2 w-full px-4 py-2 hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${
                  engine.id === settings.searchEngine ? 'bg-black/5 dark:bg-white/5' : ''
                }`}
              >
                <img src={engine.icon} alt="" className="w-4 h-4" />
                <span className="text-gray-800 dark:text-white">{engine.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHistory && filteredHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg shadow-lg overflow-hidden z-40"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200/50 dark:border-gray-700/50">
              <span className="text-xs text-gray-500 dark:text-gray-400">搜索历史</span>
              <button
                onClick={() => {
                  clearSearchHistory();
                  setShowHistory(false);
                }}
                className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                清除
              </button>
            </div>
            {filteredHistory.slice(0, 8).map((item, index) => (
              <button
                key={item}
                onClick={() => handleSearch(item)}
                className={`flex items-center gap-2 w-full px-4 py-2 hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${
                  index === highlightIndex ? 'bg-black/10 dark:bg-white/10' : ''
                }`}
              >
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-gray-800 dark:text-white text-sm">{item}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
