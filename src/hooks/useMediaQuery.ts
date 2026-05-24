'use client';

import { useState, useEffect } from 'react';

/**
 * A hook that returns whether a media query matches the current viewport.
 * @param query The media query to match against (e.g., '(min-width: 1024px)')
 * @returns boolean
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}
