import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreVertical, Edit, Trash2, FolderInput } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import type { Site } from '@/types';

interface CardProps {
  site: Site;
  onEdit: (site: Site) => void;
}

export function Card({ site, onEdit }: CardProps) {
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
    opacity: isDragging ? 0.5 : 1,
  };

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
        className="flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer transition-all"
        style={{
          backgroundColor: `rgba(255, 255, 255, ${settings.cardOpacity})`,
          borderRadius: `${settings.cardRadius}px`,
        }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-700 overflow-hidden"
          style={{ borderRadius: `${settings.cardRadius * 0.8}px` }}
        >
          {site.icon ? (
            <img src={site.icon} alt="" className="w-8 h-8 object-contain" />
          ) : (
            <span className="text-2xl font-bold text-gray-400">
              {site.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <span className="text-sm text-gray-700 dark:text-gray-200 truncate max-w-[80px]">
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
