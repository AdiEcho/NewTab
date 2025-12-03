import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Sun,
  Moon,
  Monitor,
  Palette,
  Cloud,
  Download,
  Upload,
  Server,
  Search,
  Plus,
  Trash2,
  MessageSquare,
  RotateCcw,
} from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { createWebDAVClient } from '@/utils/api';
import type { ThemeMode, WallpaperSource, HitokotoType } from '@/types';
import { HITOKOTO_TYPES, DEFAULT_SEARCH_ENGINES } from '@/types';

interface SettingsModalProps {
  onClose: () => void;
}

type SettingsTab = 'appearance' | 'search' | 'hitokoto' | 'data';

export function SettingsModal({ onClose }: SettingsModalProps) {
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);
  const addSearchEngine = useStore((state) => state.addSearchEngine);
  const removeSearchEngine = useStore((state) => state.removeSearchEngine);
  const exportData = useStore((state) => state.exportData);
  const importData = useStore((state) => state.importData);
  const resetSettings = useStore((state) => state.resetSettings);
  const resetAll = useStore((state) => state.resetAll);

  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [newEngine, setNewEngine] = useState({ name: '', url: '', icon: '' });
  const [webdavStatus, setWebdavStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [syncStatus, setSyncStatus] = useState<string>('');

  const themeColor = settings.themeColor;

  const tabs: { id: SettingsTab; name: string; icon: React.ReactNode }[] = [
    { id: 'appearance', name: '外观', icon: <Palette className="w-4 h-4" /> },
    { id: 'search', name: '搜索', icon: <Search className="w-4 h-4" /> },
    { id: 'hitokoto', name: '一言', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'data', name: '数据', icon: <Cloud className="w-4 h-4" /> },
  ];

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newtab-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        try {
          const data = JSON.parse(text);
          importData(data);
          alert('导入成功！');
        } catch {
          alert('导入失败：文件格式错误');
        }
      }
    };
    input.click();
  };

  const handleTestWebDAV = async () => {
    const { url, username, password } = settings.webdav;
    if (!url) return;

    setWebdavStatus('testing');
    const client = createWebDAVClient(url, username, password);
    const success = await client.test();
    setWebdavStatus(success ? 'success' : 'error');
  };

  const handleSyncToWebDAV = async () => {
    const { url, username, password } = settings.webdav;
    if (!url) return;

    setSyncStatus('正在同步...');
    const client = createWebDAVClient(url, username, password);
    const data = exportData();
    const success = await client.upload(JSON.stringify(data));
    setSyncStatus(success ? '同步成功！' : '同步失败');
    setTimeout(() => setSyncStatus(''), 3000);
  };

  const handleSyncFromWebDAV = async () => {
    const { url, username, password } = settings.webdav;
    if (!url) return;

    setSyncStatus('正在下载...');
    const client = createWebDAVClient(url, username, password);
    const data = await client.download();
    if (data) {
      try {
        importData(JSON.parse(data));
        setSyncStatus('恢复成功！');
      } catch {
        setSyncStatus('恢复失败：数据格式错误');
      }
    } else {
      setSyncStatus('恢复失败：无法下载数据');
    }
    setTimeout(() => setSyncStatus(''), 3000);
  };

  const handleAddSearchEngine = () => {
    if (newEngine.name && newEngine.url) {
      addSearchEngine(newEngine);
      setNewEngine({ name: '', url: '', icon: '' });
    }
  };

  const toggleHitokotoType = (type: HitokotoType) => {
    const types = settings.hitokotoTypes.includes(type)
      ? settings.hitokotoTypes.filter((t) => t !== type)
      : [...settings.hitokotoTypes, type];
    updateSettings({ hitokotoTypes: types.length > 0 ? types : ['a'] });
  };

  const activeStyle = (isActive: boolean) => isActive ? {
    borderColor: themeColor,
    backgroundColor: `${themeColor}15`,
    color: themeColor,
  } : {};

  const toggleStyle = (isActive: boolean) => ({
    backgroundColor: isActive ? themeColor : undefined,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white">设置</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-40 border-r border-gray-200 dark:border-gray-700 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeTab !== tab.id ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700' : ''
                }`}
                style={activeStyle(activeTab === tab.id)}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">主题模式</h3>
                  <div className="flex gap-2">
                    {[
                      { mode: 'light' as ThemeMode, icon: <Sun className="w-4 h-4" />, label: '浅色' },
                      { mode: 'dark' as ThemeMode, icon: <Moon className="w-4 h-4" />, label: '深色' },
                      { mode: 'system' as ThemeMode, icon: <Monitor className="w-4 h-4" />, label: '跟随系统' },
                    ].map(({ mode, icon, label }) => (
                      <button
                        key={mode}
                        onClick={() => updateSettings({ theme: mode })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                          settings.theme !== mode ? 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400' : ''
                        }`}
                        style={activeStyle(settings.theme === mode)}
                      >
                        {icon}
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">主题色</h3>
                  <input
                    type="color"
                    value={settings.themeColor}
                    onChange={(e) => updateSettings({ themeColor: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">壁纸来源</h3>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { source: 'bing' as WallpaperSource, label: 'Bing每日' },
                      { source: 'local' as WallpaperSource, label: '本地图片' },
                      { source: 'color' as WallpaperSource, label: '纯色' },
                    ].map(({ source, label }) => (
                      <button
                        key={source}
                        onClick={() => updateSettings({ wallpaper: { ...settings.wallpaper, source } })}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          settings.wallpaper.source !== source ? 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400' : ''
                        }`}
                        style={activeStyle(settings.wallpaper.source === source)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {settings.wallpaper.source === 'local' && (
                    <input
                      type="text"
                      value={settings.wallpaper.url || ''}
                      onChange={(e) => updateSettings({ wallpaper: { ...settings.wallpaper, url: e.target.value } })}
                      placeholder="输入图片URL"
                      className="mt-3 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                  )}
                  {settings.wallpaper.source === 'color' && (
                    <input
                      type="color"
                      value={settings.wallpaper.color || '#1a1a2e'}
                      onChange={(e) => updateSettings({ wallpaper: { ...settings.wallpaper, color: e.target.value } })}
                      className="mt-3 w-12 h-12 rounded-lg cursor-pointer"
                    />
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    卡片圆角: {settings.cardRadius}px
                  </h3>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={settings.cardRadius}
                    onChange={(e) => updateSettings({ cardRadius: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    卡片透明度: {Math.round(settings.cardOpacity * 100)}%
                  </h3>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.cardOpacity * 100}
                    onChange={(e) => updateSettings({ cardOpacity: parseInt(e.target.value) / 100 })}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">显示随机壁纸按钮</span>
                  <button
                    onClick={() => updateSettings({ showRandomWallpaperBtn: !settings.showRandomWallpaperBtn })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      !settings.showRandomWallpaperBtn ? 'bg-gray-300 dark:bg-gray-600' : ''
                    }`}
                    style={toggleStyle(settings.showRandomWallpaperBtn)}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        settings.showRandomWallpaperBtn ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">显示天气</span>
                  <button
                    onClick={() => updateSettings({ showWeather: !settings.showWeather })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      !settings.showWeather ? 'bg-gray-300 dark:bg-gray-600' : ''
                    }`}
                    style={toggleStyle(settings.showWeather)}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        settings.showWeather ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {settings.showWeather && (
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">
                      天气城市（留空自动定位）
                    </label>
                    <input
                      type="text"
                      value={settings.weatherCity}
                      onChange={(e) => updateSettings({ weatherCity: e.target.value })}
                      placeholder="例如：Beijing,China"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      建议格式：城市名,国家，如 Beijing,China 或 Tokyo,Japan
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">显示待办事项</span>
                  <button
                    onClick={() => updateSettings({ showTodo: !settings.showTodo })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      !settings.showTodo ? 'bg-gray-300 dark:bg-gray-600' : ''
                    }`}
                    style={toggleStyle(settings.showTodo)}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        settings.showTodo ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">显示便签</span>
                  <button
                    onClick={() => updateSettings({ showNotes: !settings.showNotes })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      !settings.showNotes ? 'bg-gray-300 dark:bg-gray-600' : ''
                    }`}
                    style={toggleStyle(settings.showNotes)}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        settings.showNotes ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'search' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">默认搜索引擎</h3>
                  <div className="space-y-2">
                    {[...DEFAULT_SEARCH_ENGINES, ...settings.customSearchEngines].map((engine) => (
                      <div
                        key={engine.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          settings.searchEngine !== engine.id ? 'border-gray-200 dark:border-gray-700' : ''
                        }`}
                        style={activeStyle(settings.searchEngine === engine.id)}
                      >
                        <button
                          onClick={() => updateSettings({ searchEngine: engine.id })}
                          className="flex items-center gap-3 flex-1"
                        >
                          <img src={engine.icon} alt="" className="w-5 h-5" />
                          <span className="text-gray-800 dark:text-white">{engine.name}</span>
                        </button>
                        {engine.isCustom && (
                          <button
                            onClick={() => removeSearchEngine(engine.id)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">添加自定义搜索引擎</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newEngine.name}
                      onChange={(e) => setNewEngine({ ...newEngine, name: e.target.value })}
                      placeholder="名称"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                    <input
                      type="text"
                      value={newEngine.url}
                      onChange={(e) => setNewEngine({ ...newEngine, url: e.target.value })}
                      placeholder="搜索URL（用 %s 表示搜索词，或直接在末尾添加）"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                    <input
                      type="text"
                      value={newEngine.icon}
                      onChange={(e) => setNewEngine({ ...newEngine, icon: e.target.value })}
                      placeholder="图标URL（可选）"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                    <button
                      onClick={handleAddSearchEngine}
                      className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-80"
                      style={{ backgroundColor: themeColor }}
                    >
                      <Plus className="w-4 h-4" />
                      添加
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hitokoto' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">一言分类</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.entries(HITOKOTO_TYPES) as [HitokotoType, string][]).map(([type, label]) => (
                      <button
                        key={type}
                        onClick={() => toggleHitokotoType(type)}
                        className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                          !settings.hitokotoTypes.includes(type) ? 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400' : ''
                        }`}
                        style={activeStyle(settings.hitokotoTypes.includes(type))}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">本地备份</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Download className="w-4 h-4" />
                      导出配置
                    </button>
                    <button
                      onClick={handleImport}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Upload className="w-4 h-4" />
                      导入配置
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">WebDAV 同步</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={settings.webdav.url}
                      onChange={(e) =>
                        updateSettings({ webdav: { ...settings.webdav, url: e.target.value } })
                      }
                      placeholder="WebDAV 地址"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                    <input
                      type="text"
                      value={settings.webdav.username}
                      onChange={(e) =>
                        updateSettings({ webdav: { ...settings.webdav, username: e.target.value } })
                      }
                      placeholder="用户名"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                    <input
                      type="password"
                      value={settings.webdav.password}
                      onChange={(e) =>
                        updateSettings({ webdav: { ...settings.webdav, password: e.target.value } })
                      }
                      placeholder="密码"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={handleTestWebDAV}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Server className="w-4 h-4" />
                        测试连接
                        {webdavStatus === 'testing' && '...'}
                        {webdavStatus === 'success' && ' ✓'}
                        {webdavStatus === 'error' && ' ✗'}
                      </button>
                      <button
                        onClick={handleSyncToWebDAV}
                        className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-80"
                        style={{ backgroundColor: themeColor }}
                      >
                        <Upload className="w-4 h-4" />
                        同步到云端
                      </button>
                      <button
                        onClick={handleSyncFromWebDAV}
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80"
                        style={{ borderColor: themeColor, color: themeColor }}
                      >
                        <Download className="w-4 h-4" />
                        从云端恢复
                      </button>
                    </div>
                    {syncStatus && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{syncStatus}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">重置</h3>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => {
                        if (confirm('确定要重置所有设置吗？网站数据将保留。')) {
                          resetSettings();
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                      <RotateCcw className="w-4 h-4" />
                      重置设置
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('确定要重置所有数据吗？这将清除所有网站、分组和设置！')) {
                          resetAll();
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                      重置全部
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    "重置设置"仅重置外观等设置，保留网站数据；"重置全部"将清除所有数据。
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
