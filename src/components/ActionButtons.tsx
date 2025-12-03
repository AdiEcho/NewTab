import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Plus, RefreshCw, BookMarked } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { SettingsModal } from './Modals/SettingsModal';
import { AddSiteModal } from './Modals/AddSiteModal';

interface ActionButtonsProps {
  onRefreshWallpaper: () => void;
  wallpaperLoading: boolean;
}

export function ActionButtons({ onRefreshWallpaper, wallpaperLoading }: ActionButtonsProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showAddSite, setShowAddSite] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);

  const settings = useStore((state) => state.settings);
  const addSite = useStore((state) => state.addSite);

  const importFromBookmarks = async () => {
    if (!chrome?.bookmarks) {
      alert('书签功能仅在浏览器扩展中可用');
      return;
    }

    try {
      const bookmarks = await chrome.bookmarks.getTree();
      const sites: { name: string; url: string }[] = [];

      const traverse = (nodes: chrome.bookmarks.BookmarkTreeNode[]) => {
        for (const node of nodes) {
          if (node.url) {
            sites.push({ name: node.title, url: node.url });
          }
          if (node.children) {
            traverse(node.children);
          }
        }
      };

      traverse(bookmarks);

      const importCount = Math.min(sites.length, 50);
      for (let i = 0; i < importCount; i++) {
        const site = sites[i];
        addSite({
          name: site.name || new URL(site.url).hostname,
          url: site.url,
          groupId: 'default',
        });
      }

      alert(`成功导入 ${importCount} 个书签`);
    } catch (error) {
      console.error('Import bookmarks error:', error);
      alert('导入书签失败');
    }
    setShowImportMenu(false);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        {settings.showRandomWallpaperBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onRefreshWallpaper}
            disabled={wallpaperLoading}
            className="p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30 hover:bg-white/30 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-white ${wallpaperLoading ? 'animate-spin' : ''}`} />
          </motion.button>
        )}

        <div className="relative">
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowImportMenu(!showImportMenu)}
            className="p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30 hover:bg-white/30 transition-colors"
          >
            <BookMarked className="w-5 h-5 text-white" />
          </motion.button>

          <AnimatePresence>
            {showImportMenu && (
              <>
                <div className="fixed inset-0" onClick={() => setShowImportMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden min-w-[150px]"
                >
                  <button
                    onClick={importFromBookmarks}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    从书签导入
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAddSite(true)}
          className="p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30 hover:bg-white/30 transition-colors"
        >
          <Plus className="w-5 h-5 text-white" />
        </motion.button>

        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowSettings(true)}
          className="p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30 hover:bg-white/30 transition-colors"
        >
          <Settings className="w-5 h-5 text-white" />
        </motion.button>
      </div>

      <AnimatePresence>
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
        {showAddSite && <AddSiteModal onClose={() => setShowAddSite(false)} />}
      </AnimatePresence>
    </>
  );
}
