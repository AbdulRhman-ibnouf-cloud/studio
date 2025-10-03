
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m4.93 19.07 1.41-1.41" />
      <path d="m17.66 6.34 1.41-1.41" />
    </svg>
  );
  
  const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );

export function ThemeToggleSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-10 w-20 rounded-full bg-muted" />;
  }

  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const spring = {
    type: 'spring',
    stiffness: 700,
    damping: 30,
  };

  return (
    <div className="flex items-center gap-4">
      <span className={cn("font-medium", !isDark ? "text-primary" : "text-muted-foreground")}>Light</span>
      <div
        className={cn(
          'relative flex h-10 w-20 cursor-pointer items-center rounded-full p-1 transition-colors duration-300',
          isDark ? 'bg-blue-900/70 justify-end' : 'bg-yellow-300/80 justify-start'
        )}
        onClick={toggleTheme}
      >
        <motion.div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md"
          layout
          transition={spring}
        >
          {isDark ? (
            <MoonIcon className="h-5 w-5 text-blue-500" />
          ) : (
            <SunIcon className="h-5 w-5 text-yellow-500" />
          )}
        </motion.div>
      </div>
      <span className={cn("font-medium", isDark ? "text-primary" : "text-muted-foreground")}>Dark</span>
    </div>
  );
}
