'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { useEffect, useMemo, useRef } from 'react';

export type FriendshipStatus = 'pending' | 'accepted' | 'declined';

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  users?: {
    id: string;
    steam_account_id: string;
    steam_name: string;
    email: string;
  };
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  related_user_id: string | null;
  related_match_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  followed_steam_id: string;
  created_at: string;
}

type SupabaseFriendRow = {
  requester_id: string;
  addressee_id: string;
  requester: Record<string, unknown>;
  addressee: Record<string, unknown>;
};

export const useFriends = () => {
  const { user } = useSupabaseAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const supabase = useMemo(() => createClient(), []);
  const instanceIdRef = useRef<string | null>(null);

  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ['friends', userId],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('friendships')
        .select('*, requester:requester_id(*), addressee:addressee_id(*)')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (error) throw error;
      return ((data || []) as SupabaseFriendRow[]).map((f) => ({
        ...f,
        users: f.requester_id === user.id ? f.addressee : f.requester
      }));
    },
    enabled: !!user,
  });

  const { data: following = [], isLoading: followingLoading } = useQuery({
    queryKey: ['following', userId],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!userId) return;
    if (!instanceIdRef.current) {
      instanceIdRef.current = Math.random().toString(36).substring(7);
    }

    const channelName = `friends_updates_${userId}_${instanceIdRef.current}`;
    const channel = supabase.channel(channelName);
    
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `or(requester_id.eq.${userId},addressee_id.eq.${userId})`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['friends', userId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `follower_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['following', userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient, supabase]);

  const followMutation = useMutation({
    mutationFn: async ({ steamAccountId, steamName }: { steamAccountId: string, steamName?: string }) => {
      if (!user) throw new Error('Not logged in');
      const { error } = await supabase
        .from('follows')
        .insert({ 
          follower_id: user.id, 
          followed_steam_id: steamAccountId,
          steam_name: steamName 
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following', userId] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async (steamAccountId: string) => {
      if (!user) throw new Error('Not logged in');
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('followed_steam_id', steamAccountId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following', userId] });
    },
  });

  const sendFriendRequestMutation = useMutation({
    mutationFn: async (addresseeId: string) => {
      if (!user) throw new Error('Not logged in');
      const { error } = await supabase
        .from('friendships')
        .insert({ requester_id: user.id, addressee_id: addresseeId, status: 'pending' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', userId] });
    },
  });

  const isFollowing = (steamAccountId: string) => {
    return following.some(f => f.followed_steam_id === steamAccountId.toString());
  };

  const isFriend = (targetUserId: string) => {
    return friends.some(f => f.requester_id === targetUserId || f.addressee_id === targetUserId);
  };

  return { 
    friends, 
    following, 
    loading: friendsLoading || followingLoading, 
    followUser: (steamAccountId: string, steamName?: string) => followMutation.mutate({ steamAccountId, steamName }),
    unfollowUser: unfollowMutation.mutate,
    sendFriendRequest: sendFriendRequestMutation.mutate,
    isFollowing,
    isFriend
  };
};

export const useNotifications = () => {
  const { user } = useSupabaseAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const supabase = useMemo(() => createClient(), []);
  const instanceIdRef = useRef<string | null>(null);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    if (!userId) return;
    if (!instanceIdRef.current) {
      instanceIdRef.current = Math.random().toString(36).substring(7);
    }

    const channelName = `notifications_${userId}_${instanceIdRef.current}`;
    const channel = supabase.channel(channelName);
    
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient, supabase]);

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    }
  });

  const handleFriendRequestMutation = useMutation({
    mutationFn: async ({ notification, accept }: { notification: AppNotification, accept: boolean }) => {
      if (!user || !notification.related_user_id) return;
      
      const newStatus = accept ? 'accepted' : 'declined';
      const { error: fError } = await supabase
        .from('friendships')
        .update({ status: newStatus })
        .eq('requester_id', notification.related_user_id)
        .eq('addressee_id', user.id)
        .eq('status', 'pending');

      if (fError) throw fError;

      const { error: nError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification.id);
      
      if (nError) throw nError;

      return { accept };
    },
    onSuccess: (data) => {
      if (data?.accept) {
        queryClient.invalidateQueries({ queryKey: ['friends', userId] });
      }
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    }
  });

  return { 
    notifications, 
    unreadCount, 
    loading: isLoading,
    markAsRead: markAsReadMutation.mutate, 
    markAllAsRead: markAllAsReadMutation.mutate,
    handleFriendRequest: (notification: AppNotification, accept: boolean) => 
      handleFriendRequestMutation.mutate({ notification, accept }),
  };
};
