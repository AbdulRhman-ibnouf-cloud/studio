
'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggleSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Avoid rendering mismatch during server-side rendering
    return <div className="w-32 h-10 rounded-full bg-muted animate-pulse" />;
  }
  
  const isDark = theme === 'dark';

  return (
    <div className="relative flex items-center w-32 h-10 p-1 rounded-full cursor-pointer bg-muted" onClick={() => setTheme(isDark ? 'light' : 'dark')}>
      <div
        className="absolute h-8 w-14 rounded-full bg-background shadow-md transform transition-transform duration-300 ease-in-out"
        style={{ transform: isDark ? 'translateX(calc(100% - 4px))' : 'translateX(4px)' }}
      />
      <div className="flex justify-around w-full">
        <span className={`z-10 transition-colors duration-300 ${!isDark ? 'text-primary' : 'text-muted-foreground'}`}>
          <Sun className="w-5 h-5" />
        </span>
        <span className={`z-10 transition-colors duration-300 ${isDark ? 'text-primary' : 'text-muted-foreground'}`}>
          <Moon className="w-5 h-5" />
        </span>
      </div>
    </div>
  );
}
