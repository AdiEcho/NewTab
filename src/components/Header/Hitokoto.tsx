import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { fetchHitokoto, clearHitokotoCache } from '@/utils/api';
import type { HitokotoData } from '@/types';

export function Hitokoto() {
  const [data, setData] = useState<HitokotoData | null>(null);
  const [loading, setLoading] = useState(false);
  const hitokotoTypes = useStore((state) => state.settings.hitokotoTypes);

  const handleRefresh = async () => {
    clearHitokotoCache();
    setLoading(true);
    const result = await fetchHitokoto(hitokotoTypes);
    if (result) {
      setData(result);
    }
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    
    const load = async () => {
      setLoading(true);
      const result = await fetchHitokoto(hitokotoTypes);
      if (!cancelled && result) {
        setData(result);
      }
      if (!cancelled) {
        setLoading(false);
      }
    };
    
    load();
    
    return () => {
      cancelled = true;
    };
  }, [hitokotoTypes]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-xs text-right"
    >
      <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-lg px-4 py-3 border border-white/20">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-white/90 leading-relaxed">
            {data?.hitokoto || '加载中...'}
          </p>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
          >
            <RefreshCw className={`w-3 h-3 text-white/70 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {data?.from && (
          <p className="text-xs text-white/50 mt-1">
            —— {data.from_who ? `${data.from_who}「${data.from}」` : data.from}
          </p>
        )}
      </div>
    </motion.div>
  );
}
