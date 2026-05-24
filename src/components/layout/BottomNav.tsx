'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  Zap,
  Trophy,
  User,
  LogIn
} from '@/components/ui/Icons';
import { cn } from '@/utils/cn';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { useTheme } from '@/context/ThemeContext';

const BOTTOM_NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Search', href: '/search', icon: Search },
  { label: 'Meta', href: '/meta', icon: Zap },
  { label: 'Pro', href: '/pro', icon: Trophy },
  { label: 'Profile', href: '/profile', icon: User, authRequired: true },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user, steamAccountId } = useSupabaseAuth();
  const { resolvedTheme } = useTheme();

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 h-16 z-50 flex items-center justify-around border-t border-(--card-border) safe-area-bottom pb-safe"
      style={{ 
        background: 'var(--sidebar-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}
    >
      {BOTTOM_NAV_ITEMS.map((item) => {
        // If it's the profile link and we have a steam ID, use the specific profile URL
        let href = item.href;
        if (item.href === '/profile' && steamAccountId) {
          href = `/profile/${steamAccountId}`;
        }

        // If auth is required but no user, show Sign In instead of Profile
        if (item.authRequired && !user) {
          return (
            <Link
              key="sign-in"
              href="/sign-in"
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors",
                pathname === '/sign-in' ? "text-gaming-accent" : "text-muted-foreground"
              )}
            >
              <LogIn className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-tight">Sign In</span>
            </Link>
          );
        }

        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

        return (
          <Link
            key={item.label}
            href={href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors relative",
              isActive ? "text-gaming-accent" : "text-muted-foreground"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-transform duration-300",
              isActive && "scale-110"
            )} />
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-tight transition-opacity",
              isActive ? "opacity-100" : "opacity-70"
            )}>
              {item.label}
            </span>
            {isActive && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gaming-accent rounded-b-full shadow-[0_0_10px_rgba(var(--gaming-accent-rgb),0.5)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
