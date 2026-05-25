'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { usePresence } from '@/context/PresenceContext';

export function PresenceManager() {
  const pathname = usePathname();
  const { updateActivity } = usePresence();

  useEffect(() => {
    let activity = 'Browsing DotaApp';

    if (pathname === '/') activity = 'Viewing Dashboard';
    else if (pathname.startsWith('/match/')) activity = `Analyzing Match ${pathname.split('/').pop()}`;
    else if (pathname.startsWith('/profile/')) activity = 'Checking Player Stats';
    else if (pathname === '/meta') activity = 'Studying Hero Meta';
    else if (pathname === '/pro') activity = 'Watching Pro Scene';
    else if (pathname === '/compare') activity = 'Comparing Players';
    else if (pathname === '/settings') activity = 'Adjusting Settings';

    updateActivity(activity);
  }, [pathname, updateActivity]);

  return null;
}
