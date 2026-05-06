'use client';

import React, { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useNotifications, useFriends } from '@/hooks/useFriends';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { 
  Bell, 
  UserPlus, 
  Check, 
  X, 
  MessageSquare, 
  Trophy, 
  Gamepad2,
  Trash2,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/utils/cn';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, loading } = useNotifications();
  const { friends, friendsLoading } = useFriends() as any;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request': return <UserPlus className="w-5 h-5 text-blue-400" />;
      case 'friend_accepted': return <Check className="w-5 h-5 text-green-400" />;
      case 'activity': return <Trophy className="w-5 h-5 text-amber-500" />;
      case 'mention': return <MessageSquare className="w-5 h-5 text-purple-400" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleNotificationClick = (n: any) => {
    if (!n.is_read) {
      markAsRead(n.id);
    }

    if (n.type === 'friend_request' || n.type === 'friend_accepted') {
      router.push(`/friends`);
    } else if (n.related_match_id) {
      router.push(`/match/${n.related_match_id}`);
    } else if (n.related_user_id) {
      router.push(`/profile/${n.related_user_id}`);
    }
  };

  const markAllAsRead = () => {
    notifications.forEach(n => {
      if (!n.is_read) markAsRead(n.id);
    });
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-600/20 rounded-2xl border border-purple-600/50">
              <Bell className="w-8 h-8 text-purple-500" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white italic uppercase tracking-wider">
                Notifications
              </h1>
              <p className="text-gray-400">Stay updated with your friends and the community</p>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              onClick={markAllAsRead}
              className="text-purple-400 hover:text-purple-300 gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark all as read
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <GlassCard key={i} className="p-6 h-24 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/5 rounded w-1/2" />
                    <div className="h-3 bg-white/5 rounded w-1/4" />
                  </div>
                </div>
              </GlassCard>
            ))
          ) : notifications.length > 0 ? (
            notifications.map((n) => (
              <GlassCard 
                key={n.id} 
                className={cn(
                  "p-6 transition-all cursor-pointer group hover:bg-white/5",
                  !n.is_read ? "border-purple-500/50 bg-purple-500/5" : "border-white/10"
                )}
                onClick={() => handleNotificationClick(n)}
              >
                <div className="flex gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border",
                    !n.is_read ? "bg-purple-600/20 border-purple-600/50" : "bg-white/5 border-white/10"
                  )}>
                    {getNotificationIcon(n.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <p className={cn(
                        "text-sm font-bold truncate",
                        !n.is_read ? "text-white" : "text-gray-400"
                      )}>
                        {n.message}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-gray-600 font-black uppercase whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    
                    {!n.is_read && (
                      <div className="mt-4 flex items-center gap-3">
                         <Button size="sm" className="h-8 text-[10px] uppercase font-black px-4 bg-purple-600 hover:bg-purple-500">
                           View Details
                         </Button>
                         <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(n.id);
                          }}
                          className="text-[10px] uppercase font-black text-gray-500 hover:text-white transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>

                  {!n.is_read && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full shrink-0" />
                  )}
                </div>
              </GlassCard>
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 opacity-40">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                <Bell className="w-12 h-12 text-gray-500" />
              </div>
              <div className="max-w-xs space-y-2">
                <h3 className="text-2xl font-black uppercase italic">All Caught Up!</h3>
                <p className="font-bold">You don&apos;t have any new notifications at the moment.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
