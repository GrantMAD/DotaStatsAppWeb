'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';

export interface UserProfile {
  id: string;
  theme?: 'light' | 'dark' | 'system';
  role?: 'user' | 'admin';
  steam_account_id?: string;
  match_limit?: number;
}

export const useUser = () => {
  const { user } = useSupabaseAuth();
  const supabase = createClient();

  return useQuery({
    queryKey: ['user', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('users')
        .select('id, theme, role, steam_account_id, match_limit')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
