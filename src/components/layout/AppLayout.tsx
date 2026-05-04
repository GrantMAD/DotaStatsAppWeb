'use client';

import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { usePathname } from 'next/navigation';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');

  if (isAuthPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <MobileHeader />
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen p-4 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      
      {/* Bottom Nav for mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 glass-card rounded-none border-x-0 border-b-0 z-50 flex items-center justify-around">
        {/* We can add quick links here later */}
      </nav>
    </div>
  );
}
