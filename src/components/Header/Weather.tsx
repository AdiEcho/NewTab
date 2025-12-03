import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchWeather } from '@/utils/api';
import { useStore } from '@/stores/useStore';
import type { WeatherData } from '@/types';

export function Weather() {
  const [data, setData] = useState<WeatherData | null>(null);
  const weatherCity = useStore((state) => state.settings.weatherCity);

  useEffect(() => {
    const load = async () => {
      const result = await fetchWeather(weatherCity || undefined);
      if (result) setData(result);
    };
    load();
  }, [weatherCity]);

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2 text-white/80 text-sm"
    >
      <span className="text-lg">{data.icon}</span>
      <span>{data.temp}°C</span>
      <span className="text-white/60">{data.city}</span>
    </motion.div>
  );
}
