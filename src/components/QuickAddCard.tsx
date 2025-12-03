import { useState, useEffect } from 'react';
import { Check, X, Link, Type, Image, Folder, Loader2 } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { getFaviconUrl } from '@/utils/api';

interface TabInfo {
  url: string;
  title: string;
  favIconUrl?: string;
}

export function QuickAddCard() {
  const groups = useStore((state) => state.groups);
  const sites = useStore((state) => state.sites);
  const addSite = useStore((state) => state.addSite);
  const settings = useStore((state) => state.settings);

  const [tabInfo, setTabInfo] = useState<TabInfo | null>(null);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('');
  const [groupId, setGroupId] = useState('default');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const dark = settings.theme === 'dark' || 
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(dark);
    document.documentElement.style.setProperty('--theme-color', settings.themeColor);
  }, [settings.theme, settings.themeColor]);

  useEffect(() => {
    getCurrentTab();
  }, []);

  const getCurrentTab = async () => {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];
      
      if (currentTab?.url && !currentTab.url.startsWith('chrome://')) {
        const info: TabInfo = {
          url: currentTab.url,
          title: currentTab.title || '',
          favIconUrl: currentTab.favIconUrl,
        };
        setTabInfo(info);
        setName(info.title);
        setUrl(info.url);
        
        if (info.favIconUrl) {
          setIcon(info.favIconUrl);
        } else {
          const faviconUrl = await getFaviconUrl(info.url);
          setIcon(faviconUrl);
        }
      } else {
        setError('无法添加此页面');
      }
    } catch (err) {
      setError('获取标签页信息失败');
    } finally {
      setLoading(false);
    }
  };

  const isAlreadyAdded = sites.some(site => {
    try {
      const siteHost = new URL(site.url).hostname;
      const currentHost = new URL(url).hostname;
      return siteHost === currentHost;
    } catch {
      return false;
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    addSite({
      name: name.trim(),
      url: url.trim(),
      icon,
      groupId,
    });

    setSuccess(true);
    setTimeout(() => window.close(), 800);
  };

  const baseClasses = isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800';
  const inputClasses = isDark 
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400';
  const labelClasses = isDark ? 'text-gray-300' : 'text-gray-700';

  if (loading) {
    return (
      <div className={`p-6 flex items-center justify-center ${baseClasses}`}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--theme-color)' }} />
      </div>
    );
  }

  if (success) {
    return (
      <div className={`p-6 flex flex-col items-center justify-center gap-3 ${baseClasses}`}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--theme-color)' }}>
          <Check className="w-6 h-6 text-white" />
        </div>
        <span className="text-sm font-medium">添加成功!</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 flex flex-col items-center justify-center gap-3 ${baseClasses}`}>
        <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
          <X className="w-6 h-6 text-white" />
        </div>
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3">
          {icon && (
            <img src={icon} alt="" className="w-8 h-8 rounded-lg object-contain" />
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-medium truncate">{tabInfo?.title}</h2>
            <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {tabInfo?.url}
            </p>
          </div>
          {isAlreadyAdded && (
            <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 whitespace-nowrap">
              已存在
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        <div>
          <label className={`flex items-center gap-1.5 text-xs font-medium ${labelClasses} mb-1.5`}>
            <Type className="w-3.5 h-3.5" />
            名称
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-3 py-2 text-sm rounded-lg border outline-none transition-colors focus:border-[var(--theme-color)] ${inputClasses}`}
            required
          />
        </div>

        <div>
          <label className={`flex items-center gap-1.5 text-xs font-medium ${labelClasses} mb-1.5`}>
            <Link className="w-3.5 h-3.5" />
            网址
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={`w-full px-3 py-2 text-sm rounded-lg border outline-none transition-colors focus:border-[var(--theme-color)] ${inputClasses}`}
            required
          />
        </div>

        <div>
          <label className={`flex items-center gap-1.5 text-xs font-medium ${labelClasses} mb-1.5`}>
            <Image className="w-3.5 h-3.5" />
            图标
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="图标URL（可选）"
              className={`flex-1 px-3 py-2 text-sm rounded-lg border outline-none transition-colors focus:border-[var(--theme-color)] ${inputClasses}`}
            />
            {icon && (
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <img src={icon} alt="" className="w-5 h-5 object-contain" />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className={`flex items-center gap-1.5 text-xs font-medium ${labelClasses} mb-1.5`}>
            <Folder className="w-3.5 h-3.5" />
            分组
          </label>
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className={`w-full px-3 py-2 text-sm rounded-lg border outline-none transition-colors focus:border-[var(--theme-color)] ${inputClasses}`}
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

        <button
          type="submit"
          className="w-full py-2.5 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'var(--theme-color)' }}
        >
          {isAlreadyAdded ? '再次添加' : '添加到新标签页'}
        </button>
      </form>
    </div>
  );
}
