'use client';

import React, { useState } from 'react';
import { MatchDetails } from '@/services/opendota';
import { getHeroImageUrl } from '@/services/constants';
import { getChatWheelPhrase } from '@/services/chatwheel';
import { GlassCard } from '../ui/GlassCard';
import { cn } from '@/utils/cn';
import { MessageSquare, Eye, EyeOff, Activity } from 'lucide-react';

export function MatchChat({ match }: { match: MatchDetails }) {
  const [showChatWheel, setShowChatWheel] = useState(true);

  if (!match.chat) {
    return (
      <div className="py-20 flex flex-col items-center justify-center border border-[var(--overlay-border)] rounded-3xl">
        <Activity className="w-12 h-12 text-gray-700 mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Parsed data required for chat logs</p>
      </div>
    );
  }

  const filteredChat = showChatWheel
    ? match.chat
    : match.chat.filter(msg => {
        const phrase = getChatWheelPhrase(msg.key);
        return msg.type !== 'chatwheel' && phrase === msg.key;
      });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4">
        <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Communication Log</h3>
        <button
          onClick={() => setShowChatWheel(!showChatWheel)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest",
            showChatWheel 
              ? "bg-gaming-accent/10 border-gaming-accent/30 text-gaming-accent" 
              : "bg-[var(--overlay-medium)] border-[var(--overlay-border)] text-gray-500 hover:text-foreground"
          )}
        >
          {showChatWheel ? <Eye size={14} /> : <EyeOff size={14} />}
          {showChatWheel ? 'Chatwheel On' : 'Chatwheel Off'}
        </button>
      </div>

      <GlassCard className="p-0 overflow-hidden bg-[var(--tech-bg)] border-[var(--overlay-border)]">
        {filteredChat.length > 0 ? (
          <div className="divide-y divide-[var(--overlay-border)]">
            {filteredChat.map((msg, idx) => {
              const player = match.players.find(p => p.player_slot === msg.player_slot);
              const minutes = Math.floor(msg.time / 60);
              const seconds = String(Math.abs(msg.time % 60)).padStart(2, '0');
              const isRadiant = msg.player_slot !== undefined && msg.player_slot < 128;
              const phrase = getChatWheelPhrase(msg.key);
              const isWheel = msg.type === 'chatwheel' || (phrase !== msg.key);

              return (
                <div key={idx} className="flex items-start gap-4 p-4 hover:bg-[var(--overlay-light)] transition-colors">
                  <div className="w-12 pt-1">
                    <span className="text-[10px] font-black text-gray-600 font-mono">
                      {msg.time < 0 ? '-' : ''}{Math.abs(minutes)}:{seconds}
                    </span>
                  </div>
                  
                  {player && (
                    <img 
                      src={getHeroImageUrl(player.hero_id)} 
                      className="w-8 h-5 rounded shadow-lg border border-[var(--overlay-border)] mt-0.5 shrink-0" 
                      alt="hero" 
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className={cn(
                        "text-xs font-black truncate max-w-[150px]",
                        isRadiant ? "text-win" : "text-loss"
                      )}>
                        {msg.unit || player?.personaname || 'Anonymous'}
                      </span>
                      
                      <div className="flex items-baseline gap-1.5 min-w-0">
                        {isWheel && <span className="text-gaming-accent font-black text-xs shrink-0">{'>'}</span>}
                        <p className={cn(
                          "text-sm leading-relaxed break-words",
                          isWheel ? "italic text-gaming-accent font-medium" : "text-foreground font-medium"
                        )}>
                          {phrase}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No messages found</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
