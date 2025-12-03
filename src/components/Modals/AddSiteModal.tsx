import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Link, Type, Image, Folder } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { getFaviconUrl, getSiteTitle } from '@/utils/api';
import type { Site } from '@/types';

interface AddSiteModalProps {
  site?: Site;
  onClose: () => void;
}

export function AddSiteModal({ site, onClose }: AddSiteModalProps) {
  const groups = useStore((state) => state.groups);
  const addSite = useStore((state) => state.addSite);
  const updateSite = useStore((state) => state.updateSite);

  const [name, setName] = useState(site?.name || '');
  const [url, setUrl] = useState(site?.url || '');
  const [icon, setIcon] = useState(site?.icon || '');
  const [groupId, setGroupId] = useState(site?.groupId || 'default');
  const [autoIcon, setAutoIcon] = useState(!site?.icon);
  const [autoName, setAutoName] = useState(!site?.name);
  const [loadingName, setLoadingName] = useState(false);

  useEffect(() => {
    if (autoIcon && url) {
      const timer = setTimeout(async () => {
        const iconUrl = await getFaviconUrl(url);
        if (iconUrl) setIcon(iconUrl);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [url, autoIcon]);

  useEffect(() => {
    if (autoName && url) {
      const timer = setTimeout(async () => {
        setLoadingName(true);
        const title = await getSiteTitle(url);
        if (title) setName(title);
        setLoadingName(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [url, autoName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    if (site) {
      updateSite(site.id, { name: name.trim(), url: finalUrl, icon, groupId });
    } else {
      addSite({ name: name.trim(), url: finalUrl, icon, groupId });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white">
            {site ? '编辑网站' : '添加网站'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Type className="w-4 h-4" />
              网站名称
              {loadingName && <span className="text-xs text-gray-400">获取中...</span>}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setAutoName(false);
              }}
              placeholder="自动获取或手动输入"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 outline-none transition-all focus:border-[var(--theme-color)]"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Link className="w-4 h-4" />
              网址
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="例如：https://google.com"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 outline-none transition-all focus:border-[var(--theme-color)]"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Image className="w-4 h-4" />
              图标URL（可选）
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={icon}
                onChange={(e) => {
                  setIcon(e.target.value);
                  setAutoIcon(false);
                }}
                placeholder="自动获取或输入图标链接"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 outline-none transition-all focus:border-[var(--theme-color)]"
              />
              {icon && (
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  <img src={icon} alt="" className="w-6 h-6 object-contain" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Folder className="w-4 h-4" />
              分组
            </label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 outline-none transition-all focus:border-[var(--theme-color)]"
            >
              {groups
                .filter((g) => g.id !== 'all')
                .map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg text-white hover:opacity-80 transition-opacity"
              style={{ backgroundColor: 'var(--theme-color)' }}
            >
              {site ? '保存' : '添加'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
