import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'amber' | 'pink' | 'green' | 'blue' | 'purple' | 'sepia' | 'crimson' | 'sunset';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'amber' || savedTheme === 'pink' || savedTheme === 'green' || savedTheme === 'blue' || savedTheme === 'purple' || savedTheme === 'sepia' || savedTheme === 'crimson' || savedTheme === 'sunset') {
      return savedTheme as Theme;
    }

    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }

    return 'dark'; // Default to dark
  });

  useEffect(() => {
    const root = document.documentElement;

    // Remove previous theme classes
    root.classList.remove('light', 'dark', 'amber', 'pink', 'green', 'blue', 'purple', 'sepia', 'crimson', 'sunset');

    // Add current theme class
    root.classList.add(theme);

    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

