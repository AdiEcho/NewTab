import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreVertical, Edit, Trash2, FolderInput } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import type { Site, CardSize } from '@/types';

const CARD_SIZES: Record<CardSize, { icon: number; padding: number; maxWidth: number }> = {
  small: { icon: 32, padding: 12, maxWidth: 60 },
  medium: { icon: 48, padding: 16, maxWidth: 80 },
  large: { icon: 64, padding: 20, maxWidth: 100 },
};

interface CardProps {
  site: Site;
  onEdit: (site: Site) => void;
  isDragOverlay?: boolean;
}

export function Card({ site, onEdit, isDragOverlay = false }: CardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const settings = useStore((state) => state.settings);
  const groups = useStore((state) => state.groups);
  const deleteSite = useStore((state) => state.deleteSite);
  const updateSite = useStore((state) => state.updateSite);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: site.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    scale: isDragging ? 0.95 : 1,
  };

  const sizeConfig = CARD_SIZES[settings.cardSize || 'medium'];
  
  const isDark = useMemo(() => {
    if (settings.theme === 'dark') return true;
    if (settings.theme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, [settings.theme]);

  const handleClick = () => {
    window.location.href = site.url;
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMenu(true);
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className="relative group"
      onContextMenu={handleContextMenu}
    >
      <div
        {...attributes}
        {...listeners}
        onClick={handleClick}
        className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${
          isDragOverlay ? 'shadow-2xl ring-2 ring-white/30' : ''
        }`}
        style={{
          backgroundColor: isDark 
            ? `rgba(55, 65, 81, ${settings.cardOpacity})` 
            : `rgba(255, 255, 255, ${settings.cardOpacity})`,
          borderRadius: `${settings.cardRadius}px`,
          padding: `${sizeConfig.padding}px`,
          backdropFilter: settings.cardGlassEffect ? `blur(${settings.cardBlur}px)` : undefined,
          WebkitBackdropFilter: settings.cardGlassEffect ? `blur(${settings.cardBlur}px)` : undefined,
          transform: isDragOverlay ? 'scale(1.05)' : undefined,
          cursor: isDragOverlay ? 'grabbing' : undefined,
        }}
      >
        <div
          className="rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-600 overflow-hidden"
          style={{ 
            borderRadius: `${settings.cardRadius * 0.8}px`,
            width: `${sizeConfig.icon}px`,
            height: `${sizeConfig.icon}px`,
          }}
        >
          {site.icon ? (
            <img 
              src={site.icon} 
              alt="" 
              className="object-contain"
              style={{ width: `${sizeConfig.icon * 0.67}px`, height: `${sizeConfig.icon * 0.67}px` }}
            />
          ) : (
            <span 
              className="font-bold text-gray-400"
              style={{ fontSize: `${sizeConfig.icon * 0.5}px` }}
            >
              {site.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <span 
          className="text-sm text-gray-700 dark:text-gray-200 truncate"
          style={{ maxWidth: `${sizeConfig.maxWidth}px` }}
        >
          {site.name}
        </span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="absolute top-1 right-1 p-1 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <MoreVertical className="w-3 h-3 text-white" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-0 right-0 mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50 min-w-[140px]"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(site);
                setShowMenu(false);
              }}
              className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
            >
              <Edit className="w-4 h-4" />
              <span className="text-sm">编辑</span>
            </button>

            <div className="relative group/move">
              <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                <FolderInput className="w-4 h-4" />
                <span className="text-sm">移动到</span>
              </button>
              <div className="absolute left-full top-0 ml-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hidden group-hover/move:block min-w-[100px]">
                {groups
                  .filter((g) => g.id !== 'all' && g.id !== site.groupId)
                  .map((group) => (
                    <button
                      key={group.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateSite(site.id, { groupId: group.id });
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                    >
                      {group.name}
                    </button>
                  ))}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteSite(site.id);
                setShowMenu(false);
              }}
              className="flex items-center gap-2 w-full px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm">删除</span>
            </button>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
