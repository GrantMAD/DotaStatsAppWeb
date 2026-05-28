'use client';

import React, { createContext, useState, useCallback, useEffect, ReactNode, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSupabaseAuth } from './SupabaseAuthContext';
import { getPlayerProfile } from '../services/opendota';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

const STORAGE_KEY = 'steam_account_id';
const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login';

interface SteamAuthContextType {
  accountId: string | null;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  handleCallback: (params: URLSearchParams) => Promise<void>;
}

export const SteamAuthContext = createContext<SteamAuthContextType | undefined>(undefined);

function SteamAuthHandler({ children, handleCallback, isAuthLoading }: { children: ReactNode, handleCallback: (params: URLSearchParams) => Promise<void>, isAuthLoading: boolean }) {
  const searchParams = useSearchParams();
  const processingRef = useRef(false);

  // Handle Callback automatically
  useEffect(() => {
    const claimedId = searchParams.get('openid.claimed_id');
    if (claimedId && !isAuthLoading && !processingRef.current) {
      processingRef.current = true;
      console.log('SteamAuthHandler: Detected Steam callback and auth is ready, processing...');
      handleCallback(searchParams).then(() => {
        console.log('SteamAuthHandler: Callback processed, clearing URL');
        // Clear search params
        const url = new URL(window.location.href);
        url.search = '';
        window.history.replaceState({}, '', url.toString());
      });
    }
  }, [searchParams, handleCallback, isAuthLoading]);

  return <>{children}</>;
}

export function SteamAuthProvider({ children }: { children: ReactNode }) {
  const [localAccountId, setLocalAccountId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY);
  });
  const [internalLoading, setInternalLoading] = useState(false);
  const { user, refreshProfile, steamAccountId, isLoading: isAuthLoading } = useSupabaseAuth();
  const supabase = createClient();
  const accountId = steamAccountId || localAccountId;
  const isLoading = isAuthLoading || internalLoading;

  const handleCallback = useCallback(async (urlParams: URLSearchParams) => {
    try {
      setInternalLoading(true);
      const claimedId = urlParams.get('openid.claimed_id');
      
      if (claimedId) {
        const match = claimedId.match(/\/id\/(\d+)$/);
        if (match && match[1]) {
          const steamId64 = match[1];
          const accId = BigInt(steamId64) - BigInt('76561197960265728');
          const accountIdStr = accId.toString();

          setLocalAccountId(accountIdStr);
          localStorage.setItem(STORAGE_KEY, accountIdStr);

          if (user) {
            const profile = await getPlayerProfile(accountIdStr);
            let steamName = null;
            
            if (profile && profile.profile) {
              steamName = profile.profile.personaname;
            }
            
            const { error } = await supabase
              .from('users')
              .update({ 
                steam_account_id: accountIdStr, 
                steam_name: steamName
              })
              .eq('id', user.id);
            
            if (error) {
              console.error('handleCallback: Database update error:', error);
              toast.error('Failed to link Steam account', { id: 'steam-auth' });
            } else {
              toast.success(`Successfully linked as ${steamName || 'Steam User'}`, { id: 'steam-auth' });
              await refreshProfile();
            }
          }
        }
      }
    } catch (e) {
      console.error('Steam callback handling failed', e);
      toast.error('An error occurred during Steam authentication', { id: 'steam-auth' });
    } finally {
      setInternalLoading(false);
    }
  }, [user, refreshProfile, supabase]);

  const login = useCallback(() => {
    setInternalLoading(true);
    const host = window.location.origin;
    const currentPath = window.location.pathname;
    const redirectUrl = `${host}/api/auth/steam?next=${encodeURIComponent(currentPath)}`;
    
    const params = new URLSearchParams({
      'openid.ns': 'http://specs.openid.net/auth/2.0',
      'openid.mode': 'checkid_setup',
      'openid.return_to': redirectUrl,
      'openid.realm': host,
      'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
      'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
    });

    const url = `${STEAM_OPENID_URL}?${params.toString()}`;
    window.open(url, '_blank');
    setInternalLoading(false);
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEY);
    setLocalAccountId(null);
    
    if (user) {
      await supabase
        .from('users')
        .update({ steam_account_id: null, steam_name: null })
        .eq('id', user.id);
      await refreshProfile();
      toast.error('Steam account unlinked', { id: 'steam-auth' });
    }
  }, [user, refreshProfile, supabase]);

  return (
    <SteamAuthContext.Provider value={{ accountId, isLoading, login, logout, handleCallback }}>
      <Suspense fallback={null}>
        <SteamAuthHandler handleCallback={handleCallback} isAuthLoading={isAuthLoading}>
          {children}
        </SteamAuthHandler>
      </Suspense>
    </SteamAuthContext.Provider>
  );
}
