'use client';

import React from 'react';
import { cn } from '@/utils/cn';

interface SectionHeaderProps {
  icon: any;
  title: string;
  description?: string;
  color: string;
}

export function SectionHeader({ icon: Icon, title, description, color }: SectionHeaderProps) {
  return (
    <div className="mb-6 mt-12 px-2">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg bg-[var(--nav-hover)]", color)}>
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-black text-foreground tracking-tight">{title}</h2>
      </div>
      {description && (
        <p className="mt-2 text-gray-500 text-sm font-medium max-w-2xl">{description}</p>
      )}
    </div>
  );
}
