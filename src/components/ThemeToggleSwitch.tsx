
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Cloud, Cloudy, Star, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function ThemeToggleSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-10 w-24 rounded-full bg-muted" />;
  }
  
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const spring = {
    type: 'spring',
    stiffness: 500,
    damping: 40,
  };

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={toggleTheme}
        className={cn(
          'relative flex h-10 w-24 cursor-pointer items-center rounded-full p-1 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 overflow-hidden',
          isDark ? 'bg-black' : 'bg-sky-500'
        )}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        <AnimatePresence>
          {!isDark && (
            <motion.div
              key="clouds"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Cloud fill="white" className="h-5 w-5 text-white/90 absolute -right-1 top-2" />
              <Cloudy fill="white" className="h-6 w-6 text-white/90 absolute right-4 bottom-1" />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isDark && (
            <motion.div
              key="stars"
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute inset-0 flex items-center justify-center"
            >
                <Star fill="white" className="h-4 w-4 text-yellow-300 absolute left-3 top-2"/>
                <Star fill="white" className="h-3 w-3 text-yellow-300 absolute left-8 bottom-2"/>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          layout
          transition={spring}
          className={cn(
            'absolute z-10 flex h-8 w-8 items-center justify-center rounded-full',
            isDark ? 'right-1 bg-yellow-400' : 'left-1 bg-white'
          )}
        >
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.div
                key="sun"
                initial={{ rotate: 90, scale: 0 }}
                animate={{ rotate: 0, scale: 1, transition: spring }}
                exit={{ rotate: 90, scale: 0, transition: spring }}
                className="absolute"
              >
                <Sun className="h-6 w-6 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ rotate: -90, scale: 0 }}
                animate={{ rotate: 0, scale: 1, transition: spring }}
                exit={{ rotate: 180, scale: 0, transition: spring }}
                className="absolute"
              >
                <Moon className="h-6 w-6 text-blue-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </button>
    </div>
  );
}
