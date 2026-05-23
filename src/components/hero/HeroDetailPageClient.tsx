'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { HeroDetailContent } from '@/components/hero/HeroDetailContent';

interface HeroDetailPageClientProps {
  heroId: number;
}

export function HeroDetailPageClient({ heroId }: HeroDetailPageClientProps) {
  const router = useRouter();

  return (
    <div className="pb-20">
      {/* Back Button */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-foreground transition-colors mb-8 group"
      >
        <div className="p-2 rounded-lg bg-(--nav-hover) group-hover:bg-gaming-accent group-hover:text-white transition-all">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <span className="text-xs font-black uppercase tracking-widest">Back to Meta</span>
      </button>

      <HeroDetailContent heroId={heroId} />
    </div>
  );
}
