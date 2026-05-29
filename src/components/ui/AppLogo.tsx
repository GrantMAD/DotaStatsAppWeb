import React from 'react';
import { cn } from '@/utils/cn';

interface AppLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export function AppLogo({ size = 40, showText = false, className }: AppLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="shieldGradWeb" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <path
          d="M50 5 L10 25 L10 50 C10 75 50 95 50 95 C50 95 90 75 90 50 L90 25 L50 5 Z"
          fill="url(#shieldGradWeb)"
        />
        <path
          d="M35 35 L45 35 C55 35 65 45 65 55 C65 65 55 75 45 75 L35 75 L35 35 Z M45 45 L45 65 C50 65 55 60 55 55 C55 50 50 45 45 45 Z"
          fill="white"
        />
      </svg>
      {showText && (
        <span className="text-white font-black italic uppercase tracking-tighter" style={{ fontSize: size * 0.6 }}>
          DotaApp
        </span>
      )}
    </div>
  );
}
