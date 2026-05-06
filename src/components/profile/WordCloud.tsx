'use client';

import React, { useMemo } from 'react';
import { usePlayerWordCloud } from '@/hooks/useOpenDota';
import { MessageSquare, Eye, Trophy, Map as MapIcon, MessageCircle, Flame } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { cn } from '@/utils/cn';

interface WordCloudProps {
  accountId: number;
  isPrivate?: boolean;
}

const COLORS = [
  'text-purple-400',
  'text-pink-400',
  'text-blue-400',
  'text-emerald-400',
  'text-amber-400',
  'text-red-400',
  'text-indigo-400',
];

const STOP_WORDS = new Set(['the', 'and', 'for', 'but', 'not', 'you', 'all', 'any', 'can', 'had']);

export function WordCloud({ accountId, isPrivate = false }: WordCloudProps) {
  const { data, isLoading, error } = usePlayerWordCloud(accountId);

  const processedWords = useMemo(() => {
    if (!data?.my_word_counts) return [];

    const words = Object.entries(data.my_word_counts)
      .filter(([word]) => word.length > 2 && !STOP_WORDS.has(word.toLowerCase()))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 40);

    if (words.length === 0) return [];

    const maxCount = words[0][1];

    return words.map(([text, count], index) => {
      const ratio = count / maxCount;
      const size = Math.max(0.75, Math.min(3, 0.75 + ratio * 2.25)); // rem scale
      
      return {
        text,
        count,
        size,
        colorClass: COLORS[index % COLORS.length],
      };
    });
  }, [data]);

  const persona = useMemo(() => {
    if (!data?.my_word_counts) return null;

    const counts = data.my_word_counts;
    const totalWords = Object.values(counts).reduce((a, b) => a + b, 0);

    if (totalWords < 10) return { 
      title: 'The Observer', 
      icon: Eye, 
      description: 'Rarely speaks in all-chat, prefers to let the play do the talking.',
      color: 'text-blue-400'
    };

    const strategistWords = ['mid', 'top', 'bot', 'push', 'gank', 'ward', 'back', 'b', 'rs', 'rosh'];
    const sportsmanWords = ['gg', 'wp', 'glhf', 'gl', 'hf', 'ty', 'thanks'];
    const socialiteWords = ['haha', 'lol', 'lmao', 'xd', 'rofl'];

    let strategistCount = 0;
    let sportsmanCount = 0;
    let socialiteCount = 0;

    Object.entries(counts).forEach(([word, count]) => {
      const lower = word.toLowerCase();
      if (strategistWords.includes(lower)) strategistCount += count;
      if (sportsmanWords.includes(lower)) sportsmanCount += count;
      if (socialiteWords.includes(lower)) socialiteCount += count;
    });

    if (sportsmanCount > strategistCount && sportsmanCount > socialiteCount) {
      return { title: 'The Sportsman', icon: Trophy, description: 'Known for fair play and respect towards opponents.', color: 'text-emerald-400' };
    }
    if (strategistCount > sportsmanCount && strategistCount > socialiteCount) {
      return { title: 'The Strategist', icon: MapIcon, description: 'Constantly coordinating with all-chat or calling objectives.', color: 'text-amber-400' };
    }
    if (socialiteCount > sportsmanCount && socialiteCount > strategistCount) {
      return { title: 'The Socialite', icon: MessageCircle, description: 'Brings humor and a friendly vibe to the battlefield.', color: 'text-pink-400' };
    }

    return { title: 'The Passionate Competitor', icon: Flame, description: 'Deeply invested in the game, every word carries weight.', color: 'text-red-400' };
  }, [data]);

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center border border-white/5 rounded-3xl">
        <div className="w-8 h-8 border-2 border-gaming-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Analyzing chat history...</p>
      </div>
    );
  }

  if (processedWords.length === 0) {
    return (
      <GlassCard className="flex flex-col items-center justify-center py-16 text-center border-dashed">
        <MessageSquare className="w-12 h-12 text-gray-700 mb-4" />
        <h3 className="text-white font-black text-xl mb-2 tracking-tight uppercase">
          {isPrivate ? 'Data Restricted' : 'Quiet Atmosphere'}
        </h3>
        <p className="text-gray-500 text-sm max-w-xs font-medium">
          {isPrivate 
            ? "This profile is private, so we can't analyze their social persona or chat history."
            : "No significant all-chat history found for this player. They might be a silent warrior!"}
        </p>
      </GlassCard>
    );
  }

  const Icon = persona?.icon || MessageSquare;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {persona && (
        <GlassCard className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 border-white/20">
          <div className={cn("p-4 rounded-2xl bg-white/5", persona.color)}>
            <Icon size={32} />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-black text-gaming-accent uppercase tracking-[0.2em] mb-1">Social Persona</h4>
            <h3 className="text-2xl font-black text-white tracking-tight mb-2 uppercase">{persona.title}</h3>
            <p className="text-gray-400 font-medium">{persona.description}</p>
          </div>
        </GlassCard>
      )}

      <GlassCard className="h-[400px] flex flex-col items-center justify-center relative overflow-hidden bg-black/40">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--color-gaming-accent)_0%,transparent_70%)]" />
        
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 max-w-4xl p-10 relative z-10">
          {processedWords.map((word, index) => (
            <span
              key={word.text}
              className={cn(
                "transition-all duration-500 hover:scale-125 cursor-default font-black whitespace-nowrap",
                word.colorClass
              )}
              style={{ 
                fontSize: `${word.size}rem`,
                opacity: 0.6 + (word.count / processedWords[0].count) * 0.4
              }}
            >
              {word.text}
            </span>
          ))}
        </div>

        <div className="absolute bottom-4 text-center w-full">
           <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-700">
             OpenDota Data Engine • All-Chat History
           </span>
        </div>
      </GlassCard>
    </div>
  );
}
