'use client';

import React, { useState, useMemo } from 'react';
import { WardMapData } from '@/services/opendota';
import { GlassCard } from '../ui/GlassCard';
import { Skeleton } from '../ui/Skeleton';
import { Eye, EyeOff, Map as MapIcon, Layers } from 'lucide-react';
import { cn } from '@/utils/cn';

interface WardMapHeatmapProps {
  data: WardMapData | null;
  loading?: boolean;
}

export default function WardMapHeatmap({ data, loading }: WardMapHeatmapProps) {
  const [type, setType] = useState<'obs' | 'sen'>('obs');

  const points = useMemo(() => {
    if (!data || !data[type]) return [];
    
    const wardData = data[type];
    const result: { x: number; y: number; count: number }[] = [];
    
    Object.entries(wardData).forEach(([xStr, yMap]) => {
      const x = parseInt(xStr);
      Object.entries(yMap).forEach(([yStr, count]) => {
        const y = parseInt(yStr);
        result.push({ x, y, count });
      });
    });

    // Find max count for scaling
    const maxCount = Math.max(...result.map(p => p.count), 1);
    
    return result.map(p => ({
      ...p,
      // Map OpenDota coordinates (0-256) to percentage (0-100)
      // OpenDota map origin is bottom-left, CSS origin is top-left
      left: (p.x / 256) * 100,
      top: (1 - (p.y / 256)) * 100,
      opacity: Math.max(0.2, (p.count / maxCount)),
      size: 4 + (p.count / maxCount) * 12
    }));
  }, [data, type]);

  if (loading) {
    return <Skeleton className="h-[600px] w-full rounded-3xl" />;
  }

  if (!data || (Object.keys(data.obs).length === 0 && Object.keys(data.sen).length === 0)) {
    return (
      <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-[var(--card-border)] rounded-3xl">
        <MapIcon className="w-12 h-12 text-gray-700 mb-4" />
        <p className="text-gray-500 font-bold text-center px-10 max-w-sm">
          No warding data found. OpenDota only generates ward maps for parsed matches.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">Vision Heatmap</h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Aggregated ward placements from parsed games</p>
        </div>
        
        <div className="flex bg-[var(--nav-hover)] p-1 rounded-xl border border-[var(--card-border)]">
          <button
            onClick={() => setType('obs')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
              type === 'obs' ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "text-gray-500 hover:text-foreground"
            )}
          >
            <Eye size={14} /> Observer
          </button>
          <button
            onClick={() => setType('sen')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
              type === 'sen' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-gray-500 hover:text-foreground"
            )}
          >
            <EyeOff size={14} /> Sentry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GlassCard className="p-2 aspect-square relative overflow-hidden bg-black border-2 border-[var(--card-border)]">
            {/* Map Image Layer */}
            <div 
              className="absolute inset-0 opacity-60 mix-blend-screen bg-cover bg-center grayscale contrast-125"
              style={{ backgroundImage: 'url("https://www.dotabuff.com/assets/maps/minimap-7.33-d8c973a903337e75369666c88825866164293f064f27572621764663d237b600.png")' }}
            />
            
            {/* Heatmap Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none">
              {points.map((p, i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute rounded-full blur-[2px] transition-all duration-1000",
                    type === 'obs' ? "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]" : "bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]"
                  )}
                  style={{
                    left: `${p.left}%`,
                    top: `${p.top}%`,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    opacity: p.opacity,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              ))}
            </div>

            {/* Grid Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none grid grid-cols-8 grid-rows-8">
               {Array.from({ length: 64 }).map((_, i) => (
                 <div key={i} className="border-[0.5px] border-white/20" />
               ))}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
           <GlassCard className="p-6 border-l-4 border-amber-500 bg-amber-500/5">
              <div className="flex items-center gap-3 mb-4">
                 <Layers className="text-amber-500" />
                 <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Density Analysis</h3>
              </div>
              <p className="text-xs font-bold text-gray-500 leading-relaxed mb-4">
                 The heatmap visualizes your most frequent warding locations. Brighter and larger circles indicate high-priority spots you favor in your games.
              </p>
              <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl">
                 <span className="text-[10px] font-black text-gray-400 uppercase">Parsed Data Points</span>
                 <span className="text-sm font-black text-foreground">{points.length.toLocaleString()}</span>
              </div>
           </GlassCard>

           <GlassCard className="p-6">
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-4">Warding Tips</h3>
              <ul className="space-y-4">
                 <li className="flex gap-3">
                    <div className="w-1 h-1 rounded-full bg-gaming-accent mt-1.5 shrink-0" />
                    <p className="text-[10px] font-bold text-gray-500 uppercase leading-relaxed">
                       Avoid placing wards in common "Sentry spots" indicated by clusters on your sentry heatmap.
                    </p>
                 </li>
                 <li className="flex gap-3">
                    <div className="w-1 h-1 rounded-full bg-gaming-accent mt-1.5 shrink-0" />
                    <p className="text-[10px] font-bold text-gray-500 uppercase leading-relaxed">
                       Diverse warding makes it harder for the enemy to deward you.
                    </p>
                 </li>
                 <li className="flex gap-3">
                    <div className="w-1 h-1 rounded-full bg-gaming-accent mt-1.5 shrink-0" />
                    <p className="text-[10px] font-bold text-gray-500 uppercase leading-relaxed">
                       Look for "unconventional" spots that still provide vision of key chokepoints.
                    </p>
                 </li>
              </ul>
           </GlassCard>
        </div>
      </div>
    </div>
  );
}
