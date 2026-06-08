'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage only on client after mount
  useEffect(() => {
    const savedValue = localStorage.getItem('sidebar-collapsed');
    if (savedValue === 'true') {
      setTimeout(() => setIsCollapsed(true), 0);
    }
    setTimeout(() => setMounted(true), 0);
  }, []);

  // Persist to localStorage only after mounting and when value changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebar-collapsed', String(isCollapsed));
    }
  }, [isCollapsed, mounted]);

  const toggleSidebar = () => setIsCollapsed(prev => !prev);
  const setCollapsed = (value: boolean) => setIsCollapsed(value);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
