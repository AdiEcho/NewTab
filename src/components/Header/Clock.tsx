import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const month = time.getMonth() + 1;
  const date = time.getDate();
  const weekday = WEEKDAYS[time.getDay()];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 text-white/90"
    >
      <div className="text-4xl font-light tabular-nums tracking-wider">
        {hours}:{minutes}
      </div>
      <div className="flex flex-col text-sm opacity-80">
        <span>{month}月{date}日</span>
        <span>星期{weekday}</span>
      </div>
    </motion.div>
  );
}
