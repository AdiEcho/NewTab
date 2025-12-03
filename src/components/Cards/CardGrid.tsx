import { useState } from 'react';
import { motion } from 'framer-motion';
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
import type { Site } from '@/types';

export function CardGrid() {
  const sites = useStore((state) => state.sites);
  const activeGroup = useStore((state) => state.activeGroup);
  const reorderSites = useStore((state) => state.reorderSites);

  const [editingSite, setEditingSite] = useState<Site | null>(null);

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
            className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4"
          >
            {filteredSites.map((site) => (
              <Card key={site.id} site={site} onEdit={setEditingSite} />
            ))}
          </motion.div>
        </SortableContext>
      </DndContext>

      {filteredSites.length === 0 && (
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
    </div>
  );
}
