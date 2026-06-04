'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Session, User, RealtimeChannel } from '@supabase/supabase-js';

interface SupabaseAuthContextType {
  session: Session | null;
  user: User | null;
  steamAccountId: string | null;
  matchLimit: number;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: (currentUser?: User | null) => Promise<void>;
}

export const SupabaseAuthContext = createContext<SupabaseAuthContextType>({
  session: null,
  user: null,
  steamAccountId: null,
  matchLimit: 20,
  isLoading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useSupabaseAuth = () => useContext(SupabaseAuthContext);

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [steamAccountId, setSteamAccountId] = useState<string | null>(null);
  const [matchLimit, setMatchLimit] = useState(20);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = React.useMemo(() => createClient(), []);
  const userRef = React.useRef<User | null>(null);

  // Sync ref with state
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // ✅ FIX: removed user dependency to break infinite loop
  const refreshProfile = useCallback(async (currentUser?: User | null) => {
    const activeUser = currentUser ?? userRef.current;

    if (!activeUser) {
      setSteamAccountId(null);
      setMatchLimit(20);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('steam_account_id, match_limit')
        .eq('id', activeUser.id)
        .single();

      if (!error && data) {
        setSteamAccountId(data.steam_account_id);
        if (data.match_limit) {
          setMatchLimit(data.match_limit);
        }
      }
    } catch (e) {
      console.error("Error fetching user profile:", e);
    }
  }, [supabase]);

  useEffect(() => {
    // Initial session fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        refreshProfile(currentUser).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        refreshProfile(currentUser).finally(() => setIsLoading(false));
      } else {
        setSteamAccountId(null);
        setMatchLimit(20);
        setIsLoading(false);
      }
    });

    // Real-time listener for user profile changes (e.g. Steam linking in another tab)
    let profileSubscription: RealtimeChannel | null = null;
    
    if (user) {
      profileSubscription = supabase
        .channel('public:users:id=eq.' + user.id)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'users',
          filter: `id=eq.${user.id}`
        }, (payload) => {
          console.log('Profile change detected via real-time:', payload.new);
          if (payload.new.steam_account_id !== undefined) {
            setSteamAccountId(payload.new.steam_account_id);
          }
          if (payload.new.match_limit !== undefined) {
            setMatchLimit(payload.new.match_limit);
          }
        })
        .subscribe();
    }

    return () => {
      subscription.unsubscribe();
      if (profileSubscription) profileSubscription.unsubscribe();
    };
  }, [refreshProfile, supabase, user]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = React.useMemo(() => ({
    session,
    user,
    steamAccountId,
    matchLimit,
    isLoading,
    signOut,
    refreshProfile,
  }), [session, user, steamAccountId, matchLimit, isLoading, signOut, refreshProfile]);

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}
