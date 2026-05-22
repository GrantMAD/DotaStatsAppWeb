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

// ✅ Stable supabase instance (prevents dependency warnings)
const supabase = createClient();

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSupabaseAuth();

  // ✅ FIX: initialize from localStorage safely (no useEffect needed)
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark';

    const savedTheme = localStorage.getItem('theme-preference') as Theme | null;
    return savedTheme || 'dark';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  // Fetch theme from Supabase when user logs in
  useEffect(() => {
    async function fetchUserTheme() {
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('theme')
        .eq('id', user.id)
        .single();

      if (data && !error && data.theme) {
        setThemeState(data.theme as Theme);
      }
    }

    fetchUserTheme();
  }, [user]);

  // Handle theme changes
  useEffect(() => {
    localStorage.setItem('theme-preference', theme);

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

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme, user]);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (user) {
      // Only update database when user explicitly changes theme
      supabase.from('users').update({ theme: newTheme }).eq('id', user.id).then();
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}