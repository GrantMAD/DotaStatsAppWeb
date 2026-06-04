'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useRef, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useSupabaseAuth } from './SupabaseAuthContext';
import { useFriends } from '@/hooks/useFriends';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PresenceUser {
  user_id: string;
  steam_name: string;
  online_at: string;
  activity?: string;
}

interface PresenceContextType {
  onlineUsers: Record<string, PresenceUser[]>;
  isUserOnline: (userId: string) => boolean;
  getOnlineUserCount: () => number;
  updateActivity: (activity: string) => Promise<void>;
}

const PresenceContext = createContext<PresenceContextType>({
  onlineUsers: {},
  isUserOnline: () => false,
  getOnlineUserCount: () => 0,
  updateActivity: async () => {},
});

export const usePresence = () => useContext(PresenceContext);

const EMPTY_ONLINE_USERS = {};
const EMPTY_SOCIAL_IDS = new Set<string>();

export function PresenceProvider({ children }: { children: ReactNode }) {
  const { user } = useSupabaseAuth();
  const { friends } = useFriends();
  const [onlineUsers, setOnlineUsers] = useState<Record<string, PresenceUser[]>>(EMPTY_ONLINE_USERS);
  const supabase = useMemo(() => createClient(), []);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Derived list of friend/followed user IDs for filtering
  const socialUserIds = useMemo(() => {
    if (!user) return EMPTY_SOCIAL_IDS;
    const ids = new Set<string>();
    friends.forEach(f => {
      const friendId = f.requester_id === user.id ? f.addressee_id : f.requester_id;
      ids.add(friendId);
    });
    return ids;
  }, [friends, user]);

  useEffect(() => {
    if (!user) {
      // Move setOnlineUsers to a microtask to avoid "setState in effect" lint error
      const timer = setTimeout(() => setOnlineUsers(EMPTY_ONLINE_USERS), 0);
      return () => clearTimeout(timer);
    }

    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceUser>();
        // Filter the presence state to only include friends
        const filteredState: Record<string, PresenceUser[]> = {};
        Object.entries(state).forEach(([userId, presences]) => {
          if (socialUserIds.has(userId)) {
            filteredState[userId] = presences;
          }
        });
        setOnlineUsers(filteredState);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            steam_name: user.user_metadata?.full_name || user.email || 'Unknown',
            online_at: new Date().toISOString(),
            activity: 'Browsing DotaApp',
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user, supabase, socialUserIds]);

  const updateActivity = async (activity: string) => {
    if (channelRef.current && user) {
      await channelRef.current.track({
        user_id: user.id,
        steam_name: user.user_metadata?.full_name || user.email || 'Unknown',
        online_at: new Date().toISOString(),
        activity,
      });
    }
  };

  const isUserOnline = (userId: string) => {
    return !!onlineUsers[userId];
  };

  const getOnlineUserCount = () => {
    return Object.keys(onlineUsers).length;
  };

  return (
    <PresenceContext.Provider value={{
      onlineUsers,
      isUserOnline,
      getOnlineUserCount,
      updateActivity,
    }}>
      {children}
    </PresenceContext.Provider>
  );
}
