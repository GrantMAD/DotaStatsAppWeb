'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSupabaseAuth } from './SupabaseAuthContext';
import { createClient } from '@/utils/supabase/client';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSupabaseAuth();
  const [theme, setThemeState] = useState<Theme>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [isInitialized, setIsInitialized] = useState(false);
  const supabase = createClient();

  // Load initial theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-preference') as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
    }
    setIsInitialized(true);
  }, []);

  // Fetch theme from Supabase when user logs in
  useEffect(() => {
    async function fetchUserTheme() {
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('theme')
          .eq('id', user.id)
          .single();

        if (data && !error && data.theme) {
          setThemeState(data.theme as Theme);
        }
      }
    }
    if (isInitialized) fetchUserTheme();
  }, [user, isInitialized]);

  // Handle theme changes
  useEffect(() => {
    if (!isInitialized) return;

    localStorage.setItem('theme-preference', theme);

    // Update Supabase if user is logged in
    if (user) {
      supabase.from('users').update({ theme }).eq('id', user.id).then();
    }

    const updateResolvedTheme = () => {
      if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setResolvedTheme(isDark ? 'dark' : 'light');
      } else {
        setResolvedTheme(theme);
      }
    };

    updateResolvedTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, user, isInitialized]);

  // Apply class to document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const setTheme = (newTheme: Theme) => setThemeState(newTheme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
