
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon, Cloud, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function ThemeToggleSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-12 w-28 rounded-full bg-muted" />;
  }
  
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const spring = {
    type: 'spring',
    stiffness: 500,
    damping: 30,
  };

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={toggleTheme}
        className={cn(
          'relative flex h-12 w-28 cursor-pointer items-center rounded-full p-1 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          isDark ? 'bg-zinc-800' : 'bg-sky-400'
        )}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {/* Bouncy Thumb */}
        <motion.div
          layout
          transition={spring}
          className={cn(
            'absolute z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md',
            isDark ? 'right-1' : 'left-1'
          )}
        >
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.div
                key="moon"
                initial={{ rotate: -90, scale: 0 }}
                animate={{ rotate: 0, scale: 1, transition: spring }}
                exit={{ rotate: 90, scale: 0, transition: spring }}
              >
                <Moon className="h-6 w-6 text-zinc-800" />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ rotate: 90, scale: 0 }}
                animate={{ rotate: 0, scale: 1, transition: spring }}
                exit={{ rotate: -90, scale: 0, transition: spring }}
              >
                <Sun className="h-6 w-6 text-sky-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Background Decorations */}
        <AnimatePresence>
        {isDark && (
            <motion.div
                key="stars"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: 0.1, ...spring } }}
                exit={{ opacity: 0, scale: 0.5, transition: spring }}
                className="absolute left-4"
            >
                <Star className="absolute h-3 w-3 text-yellow-300" style={{ top: '-8px', left: '0px' }} />
                <Star className="absolute h-2 w-2 text-yellow-300" style={{ top: '10px', left: '10px' }} />
                <Star className="absolute h-1 w-1 text-yellow-300" style={{ top: '-2px', left: '25px' }}/>
            </motion.div>
        )}
        </AnimatePresence>
        <AnimatePresence>
        {!isDark && (
            <motion.div
                key="clouds"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0, transition: { delay: 0.1, ...spring } }}
                exit={{ opacity: 0, x: 20, transition: spring }}
                className="absolute right-4"
            >
                <Cloud className="absolute h-5 w-5 text-white" style={{ top: '-5px', right: '0px' }} />
                <Cloud className="absolute h-3 w-3 text-white" style={{ top: '8px', right: '10px' }} />
            </motion.div>
        )}
        </AnimatePresence>
      </button>
    </div>
  );
}
