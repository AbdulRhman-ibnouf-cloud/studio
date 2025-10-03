
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggleSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Avoid rendering mismatch during server-side rendering and provide a placeholder.
    return <div className="w-40 h-10 rounded-full bg-muted animate-pulse" />;
  }
  
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <div className="flex items-center justify-center gap-4">
       <span className={cn("font-semibold transition-colors duration-300", !isDark ? 'text-foreground' : 'text-muted-foreground')}>
        Light
      </span>
      <button
        onClick={toggleTheme}
        className={cn(
          'relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          isDark ? 'bg-primary/20' : 'bg-primary/20'
        )}
        aria-label="Toggle theme"
      >
        <span
          className={cn(
            'absolute flex h-7 w-7 transform items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-300 ease-in-out',
            isDark ? 'translate-x-9' : 'translate-x-1'
          )}
        >
          <Sun className={cn("h-4 w-4 transition-transform duration-500", isDark ? "rotate-90 scale-0" : "rotate-0 scale-100")} />
          <Moon className={cn("absolute h-4 w-4 transition-transform duration-500", isDark ? "rotate-0 scale-100" : "-rotate-90 scale-0")} />
        </span>
      </button>
      <span className={cn("font-semibold transition-colors duration-300", isDark ? 'text-foreground' : 'text-muted-foreground')}>
        Dark
      </span>
    </div>
  );
}
