import React from 'react';
import { MetaPageClient } from '@/components/meta/MetaPageClient';

export const revalidate = 3600; // Update meta data every hour

export default function MetaPage() {
  return <MetaPageClient />;
}
