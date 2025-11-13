import React from 'react';
import useDarkMode from '../hooks/useDarkMode.js';
export default function ThemeToggle() {
  const [theme, setTheme] = useDarkMode();
  return (
    <button
      aria-label="Toggle dark mode"
      className="rounded border px-3 py-1 hover:bg-brand-accent/40 focus:outline-none focus-visible:ring-2"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
