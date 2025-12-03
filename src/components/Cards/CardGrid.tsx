import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useStore } from '@/stores/useStore';
import { Card } from './Card';
import { GroupTabs } from './GroupTabs';
import { AddSiteModal } from '../Modals/AddSiteModal';
import type { Site, CardSize } from '@/types';

const GRID_COLS: Record<CardSize, string> = {
  small: 'grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12',
  medium: 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10',
  large: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8',
};

export function CardGrid() {
  const sites = useStore((state) => state.sites);
  const activeGroup = useStore((state) => state.activeGroup);
  const reorderSites = useStore((state) => state.reorderSites);
  const settings = useStore((state) => state.settings);
  const cardSize = settings.cardSize || 'medium';

  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredSites =
    activeGroup === 'all'
      ? sites
      : sites.filter((site) => site.groupId === activeGroup);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sites.findIndex((s) => s.id === active.id);
      const newIndex = sites.findIndex((s) => s.id === over.id);
      reorderSites(arrayMove(sites, oldIndex, newIndex));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <GroupTabs />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={filteredSites.map((s) => s.id)} strategy={rectSortingStrategy}>
          <motion.div
            layout
            className={`grid ${GRID_COLS[cardSize]} gap-4`}
          >
            {filteredSites.map((site) => (
              <Card key={site.id} site={site} onEdit={setEditingSite} />
            ))}
            {(settings.addButtonPosition === 'card' || settings.addButtonPosition === 'both') && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowAddModal(true)}
                className="flex flex-col items-center justify-center gap-2 cursor-pointer transition-all border-2 border-dashed border-white/30 hover:border-white/50"
                style={{
                  borderRadius: `${settings.cardRadius}px`,
                  minHeight: cardSize === 'small' ? '70px' : cardSize === 'large' ? '120px' : '95px',
                }}
              >
                <Plus className="w-6 h-6 text-white/50" />
                <span className="text-xs text-white/50">添加</span>
              </motion.button>
            )}
          </motion.div>
        </SortableContext>
      </DndContext>

      {filteredSites.length === 0 && settings.addButtonPosition === 'corner' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-white/50 py-12"
        >
          <p>暂无网站，点击右下角添加</p>
        </motion.div>
      )}

      {editingSite && (
        <AddSiteModal
          site={editingSite}
          onClose={() => setEditingSite(null)}
        />
      )}

      {showAddModal && (
        <AddSiteModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
