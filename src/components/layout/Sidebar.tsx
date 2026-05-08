'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  User,
  Users,
  Trophy,
  Settings,
  BarChart2,
  Search,
  LogIn,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { NotificationBell } from './NotificationBell';
import { useSidebar } from '@/context/SidebarContext';
import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Home, color: 'text-indigo-600', bg: 'bg-indigo-600/10' },
  { label: 'Search', href: '/search', icon: Search, color: 'text-amber-600', bg: 'bg-amber-600/10' },
  { label: 'Pro Scene', href: '/pro', icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-600/10' },
  { label: 'Compare', href: '/compare', icon: BarChart2, authRequired: true, color: 'text-violet-600', bg: 'bg-violet-600/10' },
  { label: 'Friends', href: '/friends', icon: Users, authRequired: true, color: 'text-rose-600', bg: 'bg-rose-600/10' },
  { label: 'Profile', href: '/profile', icon: User, authRequired: true, color: 'text-sky-600', bg: 'bg-sky-600/10' },
  { label: 'Settings', href: '/settings', icon: Settings, authRequired: true, color: 'text-slate-600', bg: 'bg-slate-600/10' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, steamAccountId, signOut } = useSupabaseAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { theme, setTheme, resolvedTheme } = useTheme();



  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-screen rounded-none border-y-0 border-l-0 z-50 hidden lg:flex flex-col p-4 border-r border-[var(--card-border)]"
      style={{ background: 'var(--sidebar-bg)' }}
    >
      <div className={cn(
        "mb-10 flex items-center justify-between",
        isCollapsed && "flex-col gap-4"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gaming-accent rounded-xl flex items-center justify-center shadow-lg shadow-gaming-accent/20 shrink-0">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-xl font-bold text-gradient whitespace-nowrap"
              >
                DotaApp
              </motion.h1>
            )}
          </AnimatePresence>
        </div>

        <div className={cn("flex items-center gap-1", isCollapsed && "flex-col")}>
          {user && !isCollapsed && <NotificationBell />}
        </div>
      </div>

      {/* Collapse Toggle Lip */}
      <button
        onClick={toggleSidebar}
        className="absolute top-12 -right-4 w-8 h-8 bg-gaming-accent text-white rounded-full flex items-center justify-center shadow-lg shadow-gaming-accent/40 border-2 border-foreground/20 hover:scale-110 active:scale-95 transition-all z-50 group/toggle ring-4 ring-[var(--card-bg)]"
      >
        {isCollapsed ? (
          <ChevronRight size={18} className="group-hover/toggle:translate-x-0.5 transition-transform" />
        ) : (
          <ChevronLeft size={18} className="group-hover/toggle:-translate-x-0.5 transition-transform" />
        )}
      </button>

      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map((item) => {
          if (item.authRequired && !user) return null;

          const isActive = pathname === item.href || (item.href !== '/' && (pathname.startsWith(item.href + '/') || pathname === item.href));
          const href = item.href === '/profile' && steamAccountId ? `/profile/${steamAccountId}` : item.href;

          return (
            <Link
              key={item.label}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                isActive
                  ? "bg-gaming-accent text-white shadow-lg shadow-gaming-accent/20"
                  : "text-gray-400 hover:bg-[var(--nav-hover)] hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isActive
                  ? "bg-white/20 shadow-inner"
                  : resolvedTheme === 'light'
                    ? item.bg
                    : "bg-[var(--nav-hover)] group-hover:bg-gaming-accent/10"
              )}>
                <item.icon className={cn(
                  "w-5 h-5 shrink-0 transition-colors",
                  isActive
                    ? "text-white"
                    : resolvedTheme === 'light'
                      ? item.color
                      : "text-gray-400 group-hover:text-gaming-accent"
                )} />
              </div>

              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className={cn(
                      "font-medium whitespace-nowrap transition-colors",
                      isActive ? "text-white" : resolvedTheme === 'light' ? "text-slate-900" : "text-gray-400"
                    )}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {isCollapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded text-xs text-foreground opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100] shadow-xl">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        {!user ? (
          <Link
            href="/sign-in"
            className="flex items-center gap-3 px-3 py-3 rounded-xl bg-[var(--nav-hover)] text-gray-400 hover:bg-[var(--nav-hover)] hover:text-foreground transition-all border border-[var(--card-border)] group relative"
          >
            <LogIn className={cn("w-5 h-5 shrink-0 transition-colors", resolvedTheme === 'light' ? "text-gaming-accent" : "text-gray-400")} />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-medium whitespace-nowrap"
                >
                  Sign In
                </motion.span>
              )}
            </AnimatePresence>
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded text-xs text-foreground opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100] shadow-xl">
                Sign In
              </div>
            )}
          </Link>
        ) : (
          <>
            <div className={cn(
              "p-3 glass-card flex items-center gap-3 transition-all",
              isCollapsed && "p-1.5"
            )}>
              <div className="w-10 h-10 rounded-full bg-gaming-accent/20 border border-gaming-accent/50 overflow-hidden shrink-0">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gaming-accent font-bold">
                    {user.email?.[0].toUpperCase()}
                  </div>
                )}
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm font-bold text-foreground truncate">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-400 truncate">Online</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all group border border-transparent hover:border-red-500/20 relative"
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300",
                resolvedTheme === 'light' ? "bg-red-500/10" : "bg-transparent group-hover:bg-red-500/10"
              )}>
                <LogOut className={cn("w-5 h-5 group-hover:animate-pulse shrink-0 transition-colors", resolvedTheme === 'light' ? "text-red-500" : "text-gray-400")} />
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-medium whitespace-nowrap"
                  >
                    Log Out
                  </motion.span>
                )}
              </AnimatePresence>
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded text-xs text-foreground opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100] shadow-xl">
                  Log Out
                </div>
              )}
            </button>
          </>
        )}
      </div>
    </motion.aside>
  );
}
