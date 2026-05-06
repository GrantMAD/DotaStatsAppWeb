'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useFriends';
import { cn } from '@/utils/cn';
import Link from 'next/link';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const { unreadCount } = useNotifications();

  return (
    <Link 
      href="/notifications" 
      className={cn("relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group", className)}
    >
      <Bell className="w-6 h-6 group-hover:scale-110 transition-transform" />
      {unreadCount > 0 && (
        <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white border-2 border-[#0B0E14] animate-in zoom-in duration-300">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
