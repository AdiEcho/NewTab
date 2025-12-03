import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotesStore {
  content: string;
  setContent: (content: string) => void;
}

const useNotesStore = create<NotesStore>()(
  persist(
    (set) => ({
      content: '',
      setContent: (content) => set({ content }),
    }),
    { name: 'newtab-notes' }
  )
);

interface NotesWidgetProps {
  isExpanded?: boolean;
}

export function NotesWidget({ isExpanded: initialExpanded = false }: NotesWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [localContent, setLocalContent] = useState('');
  const [isSaved, setIsSaved] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const { content, setContent } = useNotesStore();

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleChange = (value: string) => {
    setLocalContent(value);
    setIsSaved(false);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      setContent(value);
      setIsSaved(true);
    }, 1000);
  };

  const handleSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setContent(localContent);
    setIsSaved(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-white/70" />
          <span className="text-sm font-medium text-white">便签</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-white/70" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/70" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <textarea
                ref={textareaRef}
                value={localContent}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleSave}
                placeholder="在这里记录笔记..."
                className="w-full h-32 px-3 py-2 bg-white/10 rounded-lg text-sm text-white placeholder-white/50 outline-none focus:bg-white/20 transition-colors resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-white/50">
                  {localContent.length} 字符
                </span>
                <div className="flex items-center gap-2">
                  {!isSaved && (
                    <span className="text-xs text-yellow-400">未保存</span>
                  )}
                  <button
                    onClick={handleSave}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isSaved
                        ? 'text-green-400 bg-green-400/10'
                        : 'text-white/70 bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <Save className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
