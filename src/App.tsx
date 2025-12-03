import { motion } from 'framer-motion';
import { Clock } from './components/Header/Clock';
import { SearchBar } from './components/Header/SearchBar';
import { Hitokoto } from './components/Header/Hitokoto';
import { Weather } from './components/Header/Weather';
import { CardGrid } from './components/Cards/CardGrid';
import { ActionButtons } from './components/ActionButtons';
import { TodoWidget } from './components/Widgets/TodoWidget';
import { NotesWidget } from './components/Widgets/NotesWidget';
import { useTheme } from './hooks/useTheme';
import { useWallpaper } from './hooks/useWallpaper';
import { useStore } from './stores/useStore';

function App() {
  useTheme();
  const { wallpaperUrl, loading, refreshWallpaper } = useWallpaper();
  const settings = useStore((state) => state.settings);

  const bgStyle = settings.wallpaper.source === 'color'
    ? { backgroundColor: settings.wallpaper.color || '#1a1a2e' }
    : wallpaperUrl
    ? {
        backgroundImage: `url(${wallpaperUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { backgroundColor: '#1a1a2e' };

  return (
    <div className="min-h-screen relative overflow-hidden" style={bgStyle}>
      {(settings.wallpaper.blur ?? 0) > 0 && wallpaperUrl && (
        <div
          className="absolute inset-0"
          style={{ backdropFilter: `blur(${settings.wallpaper.blur}px)` }}
        />
      )}

      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 min-h-screen flex flex-col p-6">
        <header className="flex flex-col gap-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <Clock />
              {settings.showWeather && <Weather />}
            </div>
            <Hitokoto />
          </div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <h1 className="font-title text-4xl font-bold text-white tracking-wider">
              NewTab
            </h1>
            <SearchBar />
          </motion.div>
        </header>

        <main className="flex-1 overflow-y-auto flex gap-6">
          <div className="flex-1">
            <CardGrid />
          </div>
          
          {(settings.showTodo || settings.showNotes) && (
            <div className="w-64 flex flex-col gap-3">
              {settings.showTodo && <TodoWidget />}
              {settings.showNotes && <NotesWidget />}
            </div>
          )}
        </main>

        <ActionButtons onRefreshWallpaper={refreshWallpaper} wallpaperLoading={loading} />
      </div>
    </div>
  );
}

export default App;
