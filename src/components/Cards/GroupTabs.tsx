import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Check } from 'lucide-react';
import { useStore } from '@/stores/useStore';

export function GroupTabs() {
  const groups = useStore((state) => state.groups);
  const activeGroup = useStore((state) => state.activeGroup);
  const setActiveGroup = useStore((state) => state.setActiveGroup);
  const addGroup = useStore((state) => state.addGroup);
  const updateGroup = useStore((state) => state.updateGroup);
  const deleteGroup = useStore((state) => state.deleteGroup);

  const [isAdding, setIsAdding] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      addGroup(newGroupName.trim());
      setNewGroupName('');
      setIsAdding(false);
    }
  };

  const handleEditGroup = (id: string) => {
    if (editName.trim()) {
      updateGroup(id, editName.trim());
      setEditingId(null);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {groups.map((group) => (
        <motion.div
          key={group.id}
          layout
          className="relative"
        >
          {editingId === group.id ? (
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md rounded-full px-3 py-1.5">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEditGroup(group.id)}
                className="bg-transparent text-white text-sm outline-none w-20"
                autoFocus
              />
              <button onClick={() => handleEditGroup(group.id)}>
                <Check className="w-3 h-3 text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveGroup(group.id)}
              onDoubleClick={() => {
                if (group.id !== 'all') {
                  setEditingId(group.id);
                  setEditName(group.name);
                }
              }}
              className={`relative px-4 py-1.5 rounded-full text-sm transition-all ${
                activeGroup === group.id
                  ? 'bg-white/30 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {group.name}
              {group.id !== 'all' && group.id !== 'default' && activeGroup === group.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteGroup(group.id);
                    setActiveGroup('all');
                  }}
                  className="absolute -top-1 -right-1 p-0.5 bg-red-500 rounded-full"
                >
                  <X className="w-2.5 h-2.5 text-white" />
                </button>
              )}
            </button>
          )}
        </motion.div>
      ))}

      {isAdding ? (
        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md rounded-full px-3 py-1.5">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddGroup();
              if (e.key === 'Escape') setIsAdding(false);
            }}
            placeholder="分组名称"
            className="bg-transparent text-white text-sm placeholder-white/50 outline-none w-20"
            autoFocus
          />
          <button onClick={handleAddGroup}>
            <Check className="w-3 h-3 text-white" />
          </button>
          <button onClick={() => setIsAdding(false)}>
            <X className="w-3 h-3 text-white/70" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <Plus className="w-4 h-4 text-white/70" />
        </button>
      )}
    </div>
  );
}
