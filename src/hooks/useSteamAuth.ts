'use client';

import { createClient } from '@/utils/supabase/client';

export const useSteamAuth = () => {
  const supabase = createClient();

  const signInWithSteam = async () => {
    // This will be implemented with the actual Steam OpenID flow
    // For now, we use Supabase's built-in providers or a custom function
    console.log('Steam sign-in not yet fully implemented');
  };

  return {
    signInWithSteam,
  };
};
