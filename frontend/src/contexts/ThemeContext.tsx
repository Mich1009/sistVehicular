import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  resetToSystemTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Detectar preferencia del sistema
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme;
      const userPreference = localStorage.getItem('user-theme-preference');
      
      // Si el usuario nunca ha cambiado el tema manualmente, seguir la preferencia del sistema
      if (!userPreference) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      // Si el usuario ha cambiado el tema manualmente, usar su preferencia guardada
      if (saved) return saved;
      
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    // Escuchar cambios en la preferencia del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const userPreference = localStorage.getItem('user-theme-preference');
      
      // Solo cambiar automáticamente si el usuario no ha establecido una preferencia manual
      if (!userPreference) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    // Marcar que el usuario ha cambiado el tema manualmente
    localStorage.setItem('user-theme-preference', 'manual');
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const resetToSystemTheme = () => {
    // Resetear a la preferencia del sistema
    localStorage.removeItem('user-theme-preference');
    localStorage.removeItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(systemTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, resetToSystemTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};