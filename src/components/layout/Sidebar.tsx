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
  LogIn
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Pro Scene', href: '/pro', icon: Trophy },
  { label: 'Search', href: '/search', icon: Search },
  { label: 'Compare', href: '/compare', icon: BarChart2 },
  { label: 'Friends', href: '/friends', icon: Users, authRequired: true },
  { label: 'Profile', href: '/profile', icon: User, authRequired: true },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, steamAccountId } = useSupabaseAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass-card rounded-none border-y-0 border-l-0 z-50 hidden lg:flex flex-col p-6">
      <div className="mb-10 flex items-center gap-3">
        <div className="w-10 h-10 bg-gaming-accent rounded-xl flex items-center justify-center shadow-lg shadow-gaming-accent/20">
          <span className="text-white font-bold text-xl">D</span>
        </div>
        <h1 className="text-xl font-bold text-gradient">DotaApp</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map((item) => {
          if (item.authRequired && !user) return null;
          
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const href = item.href === '/profile' && steamAccountId ? `/profile/${steamAccountId}` : item.href;

          return (
            <Link
              key={item.label}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-gaming-accent text-white shadow-lg shadow-gaming-accent/20" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                isActive ? "text-white" : "group-hover:text-gaming-accent"
              )} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        {!user ? (
          <Link
            href="/sign-in"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <LogIn className="w-5 h-5" />
            <span className="font-medium">Sign In</span>
          </Link>
        ) : (
          <div className="p-4 glass-card bg-white/5 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gaming-accent/20 border border-gaming-accent/50 overflow-hidden">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gaming-accent font-bold">
                    {user.email?.[0].toUpperCase()}
                  </div>
                )}
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-400 truncate">Online</p>
             </div>
          </div>
        )}
      </div>
    </aside>
  );
}
