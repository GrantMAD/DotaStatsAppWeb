'use client';

import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { BottomNav } from './BottomNav';
import { PresenceManager } from './PresenceManager';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { useSidebar } from '@/context/SidebarContext';
import { motion } from 'framer-motion';
import { PageTransition } from './PageTransition';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { initializeAnalytics, trackPageView } from '@/services/analytics';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');
  const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');

  // Initialize analytics on mount
  useEffect(() => {
    initializeAnalytics();
  }, []);

  // Track page views when pathname changes
  useEffect(() => {
    if (!isAuthPage) {
      trackPageView(pathname);
    }
  }, [pathname, isAuthPage]);

  if (isAuthPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="min-h-screen">
      <PresenceManager />
      <Sidebar />
      <MobileHeader />
      <motion.main 
        animate={{ 
          marginLeft: !isLargeScreen ? '0px' : isCollapsed ? '80px' : '256px',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="pt-20 lg:pt-0 pb-20 lg:pb-0 min-h-screen p-4 lg:p-10"
      >
        <div className="max-w-7xl mx-auto">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </motion.main>
      
      <BottomNav />
    </div>
  );
}
