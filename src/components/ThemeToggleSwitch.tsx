
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon, Cloud, Star, Cloudy } from 'lucide-react';
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

  const variants = {
    initial: (isDark: boolean) => ({
      x: isDark ? -80 : 80,
      opacity: 0,
      scale: 0.5,
    }),
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { ...spring, delay: 0.2 },
    },
    exit: (isDark: boolean) => ({
      x: isDark ? 80 : -80,
      opacity: 0,
      scale: 0.5,
      transition: { ...spring, duration: 0.4 },
    }),
  };

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={toggleTheme}
        className={cn(
          'relative flex h-10 w-24 cursor-pointer items-center rounded-full p-1 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 overflow-hidden',
          isDark ? 'bg-slate-900' : 'bg-sky-500'
        )}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        <AnimatePresence initial={false} custom={isDark}>
          <motion.div
            key={isDark ? 'dark-elements' : 'light-elements'}
            custom={isDark}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 flex items-center justify-center"
          >
            {isDark ? (
              <div className="absolute inset-x-0 mx-auto flex items-center justify-center w-1/2">
                <Star className="absolute h-3 w-3 text-white" style={{ right: '20%', top: '30%' }} fill="currentColor" />
                <Star className="absolute h-4 w-4 text-white" style={{ right: '35%', top: '60%' }} fill="currentColor" />
              </div>
            ) : (
                <div className="absolute inset-x-0 mx-auto flex items-center justify-center w-1/2">
                    <Cloudy className="absolute h-5 w-5 text-white" style={{ left: '20%', top: '25%' }} fill="white" />
                    <Cloud className="absolute h-4 w-4 text-white" style={{ left: '45%', top: '55%' }} fill="currentColor"/>
                </div>
            )}
          </motion.div>
        </AnimatePresence>
        
        <motion.div
          layout
          transition={spring}
          className={cn(
            'absolute z-10 flex h-8 w-8 items-center justify-center',
             isDark ? 'right-1' : 'left-1'
          )}
        >
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.div
                key="moon"
                initial={{ rotate: -90, scale: 0 }}
                animate={{ rotate: 180, scale: 1, transition: spring }}
                exit={{ rotate: 90, scale: 0, transition: spring }}
              >
                <Moon className="h-5 w-5 text-white" fill="currentColor" />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ rotate: 90, scale: 0 }}
                animate={{ rotate: 0, scale: 1, transition: spring }}
                exit={{ rotate: -90, scale: 0, transition: spring }}
              >
                <Sun className="h-5 w-5 text-white" fill="currentColor" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </button>
    </div>
  );
}
