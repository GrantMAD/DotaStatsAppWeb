import React from 'react';
import { HeroDetailPageClient } from '@/components/hero/HeroDetailPageClient';
import { HEROES } from '@/services/constants';

export const revalidate = 86400; // Update hero data every 24 hours

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  // Pre-render pages for all known heroes
  return Object.keys(HEROES).map((id) => ({
    id: id,
  }));
}

export default async function HeroDetailPage({ params }: PageProps) {
  const { id } = await params;
  const heroId = Number(id);

  return <HeroDetailPageClient heroId={heroId} />;
}
