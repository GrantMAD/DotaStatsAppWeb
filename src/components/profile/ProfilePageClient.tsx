'use client';

import React from 'react';
import { PlayerOverviewContent } from '@/components/profile/PlayerOverviewContent';
import { PlayerProfile, WinLossStats } from '@/types';

interface ProfilePageClientProps {
  accountId: string;
  initialProfile: PlayerProfile;
  initialWL: WinLossStats | null;
  isCurrentUser: boolean;
  friendsCount: number;
  followingCount: number;
}

export function ProfilePageClient({
  accountId,
  initialProfile,
  initialWL,
  isCurrentUser,
  friendsCount,
  followingCount,
}: ProfilePageClientProps) {
  return (
    <PlayerOverviewContent
      accountId={accountId}
      profile={initialProfile}
      wl={initialWL}
      isCurrentUser={isCurrentUser}
      friendsCount={friendsCount}
      followingCount={followingCount}
      isPrivate={!initialProfile.profile}
    />
  );
}
