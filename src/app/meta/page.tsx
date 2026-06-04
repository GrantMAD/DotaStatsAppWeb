import React from 'react';
import { MetaPageClient } from '@/components/meta/MetaPageClient';
import { getServerHeroStats } from '@/services/opendota';

export const revalidate = 3600; // Update meta data every hour

export default async function MetaPage() {
  const heroesData = await getServerHeroStats();
  return <MetaPageClient initialHeroesData={heroesData} />;
}
