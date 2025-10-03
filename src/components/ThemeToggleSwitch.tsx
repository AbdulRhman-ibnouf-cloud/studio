
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Cloud, Cloudy, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 16a4 4 0 100-8 4 4 0 000 8z" />
        <path fillRule="evenodd" d="M12 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm0 20a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1zM2 12a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm20 0a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.636 5.636a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zm12.728 12.728a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414zM5.636 18.364a1 1 0 010-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414 0zm12.728-12.728a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 004.463-.69a.75.75 0 01.981.981A10.503 10.503 0 0118 19.5 10.5 10.5 0 017.5 9c0-4.347 2.726-8.11 6.544-9.663a.75.75 0 011.284.848z" clipRule="evenodd" />
    </svg>
);


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
          'relative flex h-10 w-20 cursor-pointer items-center rounded-full p-1 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 overflow-hidden',
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
              <Cloud className="h-4 w-4 text-white/90 absolute -right-1 top-2" fill="white" />
              <Cloudy className="h-5 w-5 text-white/90 absolute right-3 bottom-1" fill="white" />
              <Cloud className="h-3 w-3 text-white/90 absolute right-6 top-5" fill="white" />
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
                <Star className="h-3 w-3 text-white absolute left-2 top-2" fill="white"/>
                <Star className="h-4 w-4 text-white absolute left-6 top-4" fill="white"/>
                <Star className="h-2 w-2 text-white absolute left-9 bottom-2" fill="white"/>
            </motion.div>
          )}
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
                <MoonIcon className="h-5 w-5 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ rotate: 90, scale: 0 }}
                animate={{ rotate: 0, scale: 1, transition: spring }}
                exit={{ rotate: -90, scale: 0, transition: spring }}
              >
                <SunIcon className="h-5 w-5 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </button>
    </div>
  );
}

