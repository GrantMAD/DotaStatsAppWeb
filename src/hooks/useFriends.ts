'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { useEffect, useRef } from 'react';

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
  is_read: boolean;
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  followed_steam_id: string;
  created_at: string;
}

export const useFriends = () => {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('friendships')
        .select('*, requester:requester_id(*), addressee:addressee_id(*)')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (error) throw error;
      return (data || []).map((f: any) => ({
        ...f,
        users: f.requester_id === user.id ? f.addressee : f.requester
      }));
    },
    enabled: !!user,
  });

  const { data: following = [], isLoading: followingLoading } = useQuery({
    queryKey: ['following', user?.id],
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

  const followMutation = useMutation({
    mutationFn: async (steamAccountId: string) => {
      if (!user) throw new Error('Not logged in');
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: user.id, followed_steam_id: steamAccountId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following', user?.id] });
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
      queryClient.invalidateQueries({ queryKey: ['following', user?.id] });
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
    followUser: followMutation.mutate,
    unfollowUser: unfollowMutation.mutate,
    isFollowing,
    isFriend
  };
};

export const useNotifications = () => {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { current: instanceId } = useRef(Math.random().toString(36).substring(7));

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    if (!user) return;

    const channelName = `notifications_${user.id}_${instanceId}`;
    const channel = supabase.channel(channelName);
    
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient, instanceId]);

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    }
  });

  return { 
    notifications, 
    unreadCount, 
    loading: isLoading,
    markAsRead: markAsReadMutation.mutate, 
  };
};
