
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

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

  return (
    <div className="flex items-center justify-center gap-4">
      <span className={`font-semibold transition-colors duration-300 ${!isDark ? 'text-foreground' : 'text-muted-foreground'}`}>
        Light
      </span>
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="relative inline-flex h-8 w-16 items-center rounded-full bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-label="Toggle theme"
      >
        <div
          className={`absolute flex h-7 w-7 transform items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-300 ease-in-out ${
            isDark ? 'translate-x-9' : 'translate-x-1'
          }`}
        >
          {isDark ? (
             <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </div>
      </button>
      <span className={`font-semibold transition-colors duration-300 ${isDark ? 'text-foreground' : 'text-muted-foreground'}`}>
        Dark
      </span>
    </div>
  );
}
