'use client';

import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { usePathname } from 'next/navigation';

import { useSidebar } from '@/context/SidebarContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from './PageTransition';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();
  const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');

  if (isAuthPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <MobileHeader />
      <motion.main 
        animate={{ 
          marginLeft: isCollapsed ? '80px' : '256px',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="pt-16 lg:pt-0 min-h-screen p-4 lg:p-10"
      >
        <div className="max-w-7xl mx-auto">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </motion.main>
      
      {/* Bottom Nav for mobile */}
      <nav 
        className="lg:hidden fixed bottom-0 left-0 right-0 h-16 rounded-none border-x-0 border-b-0 z-50 flex items-center justify-around border-t border-[var(--card-border)]"
        style={{ background: 'var(--sidebar-bg)' }}
      >
        {/* We can add quick links here later */}
      </nav>
    </div>
  );
}
