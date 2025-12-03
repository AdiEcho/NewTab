import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Plus, RefreshCw } from 'lucide-react';
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

  const settings = useStore((state) => state.settings);

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

        {(settings.addButtonPosition === 'corner' || settings.addButtonPosition === 'both') && (
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
        )}

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
