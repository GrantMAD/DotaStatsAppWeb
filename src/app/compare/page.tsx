'use client';

import React, { Suspense, useState, useContext, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { 
  usePlayerProfile, 
  usePlayerWinLoss, 
  usePlayerHeroes,
  usePlayerTotals,
  useRecentMatches,
  usePlayerPeers,
  isProfilePrivate,
  isDataRestricted
} from '@/hooks/useOpenDota';
import CompareStatRow from '@/components/compare/CompareStatRow';
import RankBadge from '@/components/ui/RankBadge';
import { getHeroImageUrl } from '@/services/constants';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Plus, BarChart2, User } from 'lucide-react';
import Image from 'next/image';
import { PlayerSelectModal } from '@/components/compare/PlayerSelectModal';
import { SteamAuthContext } from '@/context/SteamAuthContext';
import { DataPrivacyIndicator } from '@/components/ui/DataPrivacyIndicator';
import { EyeOff } from 'lucide-react';

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const p1 = searchParams.get('p1');
  const p2 = searchParams.get('p2');

  const [mounted, setMounted] = useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const steamAuth = useContext(SteamAuthContext);
  const myAccountId = steamAuth?.accountId ? String(steamAuth.accountId) : null;

  // Player 1 Data
  const { data: profile1, isLoading: loadingP1 } = usePlayerProfile(p1);
  const { data: wl1 } = usePlayerWinLoss(p1);
  const { data: heroes1 } = usePlayerHeroes(p1);
  const { data: totals1, isLoading: loadingTotals1 } = usePlayerTotals(p1);
  const { data: recent1, isLoading: loadingRecent1 } = useRecentMatches(p1, 20);
  const { data: peers1, isLoading: loadingPeers1 } = usePlayerPeers(p1);

  // Player 2 Data
  const { data: profile2, isLoading: loadingP2 } = usePlayerProfile(p2);
  const { data: wl2 } = usePlayerWinLoss(p2);
  const { data: heroes2 } = usePlayerHeroes(p2);
  const { data: totals2, isLoading: loadingTotals2 } = usePlayerTotals(p2);
  const { data: recent2, isLoading: loadingRecent2 } = useRecentMatches(p2, 20);
  const { data: peers2, isLoading: loadingPeers2 } = usePlayerPeers(p2);
  
  const isP1Private = useMemo(() => isProfilePrivate(profile1 ?? null), [profile1]);
  const isP1Restricted = useMemo(() => isDataRestricted(profile1 ?? null, recent1?.length || 0), [profile1, recent1]);
  
  const isP2Private = useMemo(() => isProfilePrivate(profile2 ?? null), [profile2]);
  const isP2Restricted = useMemo(() => isDataRestricted(profile2 ?? null, recent2?.length || 0), [profile2, recent2]);

  // Hardened check: Check URL params AND fetched profile data
  const isMeInComparison = !!(myAccountId && (
    p1 === myAccountId || 
    p2 === myAccountId || 
    profile1?.profile?.account_id?.toString() === myAccountId || 
    profile2?.profile?.account_id?.toString() === myAccountId
  ));

  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [selectingFor, setSelectingFor] = useState<'p1' | 'p2' | null>(null);

  const isLoading = (p1 && (loadingP1 || loadingTotals1 || loadingRecent1 || loadingPeers1)) || 
                    (p2 && (loadingP2 || loadingTotals2 || loadingRecent2 || loadingPeers2));

  const handleOpenSelect = (target: 'p1' | 'p2') => {
    setSelectingFor(target);
    setIsSelectModalOpen(true);
  };

  const handleSelectPlayer = (accountId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectingFor) {
      params.set(selectingFor, accountId);
      router.push(`${pathname}?${params.toString()}`);
    }
    setIsSelectModalOpen(false);
    setSelectingFor(null);
  };

  const handleAddMe = (target: 'p1' | 'p2', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!myAccountId) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set(target, myAccountId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const getWR = (wl: any) => {
    if (!wl || (wl.win + wl.lose) === 0) return 0;
    return ((wl.win / (wl.win + wl.lose)) * 100).toFixed(1);
  };

  const getKDA = (heroes: any[]) => {
    if (!heroes || heroes.length === 0) return "0.00";
    const totals = heroes.reduce((acc, h) => {
      acc.kills += (h.avg_kills || 0) * h.games;
      acc.deaths += (h.avg_deaths || 0) * h.games;
      acc.assists += (h.avg_assists || 0) * h.games;
      acc.count += h.games;
      return acc;
    }, { kills: 0, deaths: 0, assists: 0, count: 0 });

    if (totals.count === 0) return "0.00";
    return ((totals.kills + totals.assists) / Math.max(1, totals.deaths)).toFixed(2);
  };

  const getAvg = (totals: any[], field: string) => {
    const entry = totals?.find(t => t.field === field);
    if (!entry || entry.n === 0) return 0;
    return Math.round(entry.sum / entry.n);
  };

  const getRecentWR = (matches: any[]) => {
    if (!matches || matches.length === 0) return 0;
    const wins = matches.filter(m => {
      const isRadiant = m.player_slot < 128;
      return (isRadiant && m.radiant_win) || (!isRadiant && !m.radiant_win);
    }).length;
    return ((wins / matches.length) * 100).toFixed(1);
  };

  const getVersatility = (heroes: any[]) => {
    return heroes?.filter(h => h.games > 0).length || 0;
  };

  const getMatchup = (peers: any[], targetId: string) => {
    if (!targetId) return null;
    const peer = peers?.find(p => p.account_id.toString() === targetId);
    if (!peer) return null;
    return {
      with: `${peer.with_win}W - ${peer.with_games - peer.with_win}L`,
      against: `${peer.against_games - peer.against_win}W - ${peer.against_win}L`,
      games: peer.games
    };
  };

  const renderPlayerHeader = (profile: any, target: 'p1' | 'p2') => {
    if (!profile) {
      return (
        <div 
          onClick={() => handleOpenSelect(target)}
          className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-[var(--card-border)] rounded-2xl hover:bg-[var(--nav-hover)] transition-colors group cursor-pointer relative min-h-[220px]"
        >
           <div className="w-16 h-16 rounded-full bg-[var(--nav-hover)] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8 text-foreground/40" />
           </div>
           <p className="mt-4 text-xs font-black uppercase text-foreground/40 tracking-widest">Select Player</p>
           
           <div className="absolute bottom-6 left-0 right-0 flex justify-center">
             {mounted && myAccountId && !isMeInComparison && (
               <button
                 onClick={(e) => handleAddMe(target, e)}
                 className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded-lg flex items-center gap-2 transition-all"
               >
                 <User className="w-3 h-3 text-purple-400" />
                 <span className="text-[10px] font-black uppercase text-purple-400">Add Me</span>
               </button>
             )}
           </div>
        </div>
      );
    }

    return (
      <div 
        onClick={() => handleOpenSelect(target)}
        className="flex-1 flex flex-col items-center justify-center p-6 cursor-pointer group relative min-h-[220px]"
      >
        <div className="relative">
          <img 
            src={profile.profile.avatarfull} 
            alt={profile.profile.personaname}
            className="w-24 h-24 rounded-2xl border-2 border-purple-500/50 shadow-2xl shadow-purple-500/20 group-hover:scale-105 transition-transform"
          />
          <div className="absolute -bottom-4 -right-4 scale-110">
            <RankBadge rankTier={profile.rank_tier} size={60} />
          </div>
        </div>
        <h2 className="text-xl font-black mt-8 text-center text-foreground truncate max-w-full px-4 group-hover:text-purple-400 transition-colors flex items-center justify-center gap-2">
          {profile.profile.personaname}
          {isProfilePrivate(profile) && (
            <EyeOff size={14} className="text-red-500" />
          )}
        </h2>
        
        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
          {mounted && myAccountId && !isMeInComparison && myAccountId !== profile.profile.account_id?.toString() && (
            <button
              onClick={(e) => handleAddMe(target, e)}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center gap-2 transition-all opacity-0 group-hover:opacity-100"
            >
              <User className="w-3 h-3 text-foreground/40" />
              <span className="text-[10px] font-black uppercase text-foreground/40">Switch to Me</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <PlayerSelectModal 
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
        onSelect={handleSelectPlayer}
        title={selectingFor === 'p1' ? "Select First Player" : "Select Second Player"}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gaming-accent/20 rounded-2xl border border-gaming-accent/50">
            <BarChart2 className="w-8 h-8 text-gaming-accent" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-foreground italic uppercase tracking-wider">
              Player <span className="text-gaming-accent">Comparison</span>
            </h1>
            <p className="text-gray-400">Compare statistics and head-to-head performance</p>
          </div>
        </div>
      </div>

      {/* Comparison Selector */}
      <GlassCard className="p-2">
        <div className="flex items-center">
          {renderPlayerHeader(profile1, 'p1')}
          <div className="w-px h-32 bg-[var(--card-border)] self-center" />
          {renderPlayerHeader(profile2, 'p2')}
        </div>
      </GlassCard>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-foreground/50 font-bold animate-pulse">Calculating Stats...</p>
        </div>
      ) : profile1 && profile2 ? (
        <div className="space-y-12">
          {(isP1Private || isP1Restricted || isP2Private || isP2Restricted) && (
            <div className="space-y-4">
              { (isP1Private || isP1Restricted) && (
                <DataPrivacyIndicator 
                  type={isP1Private ? 'profile' : 'matches'} 
                  isCurrentUser={myAccountId === p1}
                  className="border-purple-500/30"
                />
              )}
              { (isP2Private || isP2Restricted) && (
                <DataPrivacyIndicator 
                  type={isP2Private ? 'profile' : 'matches'} 
                  isCurrentUser={myAccountId === p2}
                  className="border-purple-500/30"
                />
              )}
              <GlassCard className="p-4 bg-amber-500/5 border-amber-500/20">
                <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest text-center">
                  Notice: Comparison statistics may be inaccurate or incomplete due to privacy settings.
                </p>
              </GlassCard>
            </div>
          )}

          <GlassCard className="p-8">
             <CompareStatRow 
              label="Win Rate" 
              val1={getWR(wl1)} 
              val2={getWR(wl2)} 
              unit="%" 
            />
            <CompareStatRow 
              label="Total Matches" 
              val1={wl1 ? wl1.win + wl1.lose : 0} 
              val2={wl2 ? wl2.win + wl2.lose : 0} 
            />
            <CompareStatRow 
              label="Average KDA" 
              val1={getKDA(heroes1 || [])} 
              val2={getKDA(heroes2 || [])} 
            />
            <CompareStatRow 
              label="Avg GPM" 
              val1={getAvg(totals1 || [], 'gold_per_min')} 
              val2={getAvg(totals2 || [], 'gold_per_min')} 
            />
            <CompareStatRow 
              label="Avg Deaths" 
              val1={getAvg(totals1 || [], 'deaths')} 
              val2={getAvg(totals2 || [], 'deaths')} 
              higherIsBetter={false}
            />
            <CompareStatRow 
              label="Avg XPM" 
              val1={getAvg(totals1 || [], 'xp_per_min')} 
              val2={getAvg(totals2 || [], 'xp_per_min')} 
            />
            <CompareStatRow 
              label="Recent Win Rate (Last 20)" 
              val1={getRecentWR(recent1 || [])} 
              val2={getRecentWR(recent2 || [])} 
              unit="%" 
            />
            <CompareStatRow 
              label="Hero Pool Size" 
              val1={getVersatility(heroes1 || [])} 
              val2={getVersatility(heroes2 || [])} 
              unit=" Heroes"
            />
          </GlassCard>

          {/* Direct Matchup */}
          {p2 && getMatchup(peers1 || [], p2) && (
            <GlassCard className="p-8 bg-purple-500/5 border-purple-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <BarChart2 className="w-24 h-24" />
              </div>
              
              <h3 className="text-purple-400 text-sm font-black text-center uppercase tracking-widest mb-8">
                Direct History ({getMatchup(peers1 || [], p2)?.games} Shared Matches)
              </h3>
              
              <div className="flex justify-around items-center">
                <div className="text-center">
                  <p className="text-foreground/40 text-[10px] uppercase font-black mb-2 tracking-widest">As Allies</p>
                  <p className="text-3xl font-black italic">{getMatchup(peers1 || [], p2)?.with}</p>
                </div>
                <div className="w-px h-12 bg-[var(--card-border)]" />
                <div className="text-center">
                  <p className="text-foreground/40 text-[10px] uppercase font-black mb-2 tracking-widest">As Opponents</p>
                  <p className="text-3xl font-black italic">{getMatchup(peers1 || [], p2)?.against}</p>
                </div>
              </div>
              
              <p className="text-foreground/30 text-[10px] text-center mt-8 italic">
                *History from {profile1?.profile.personaname}&apos;s perspective
              </p>
            </GlassCard>
          )}

          {/* Top Heroes Comparison */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-center uppercase italic tracking-tighter">Top Heroes Comparison</h3>
            <div className="grid gap-4">
              {[0, 1, 2].map((idx) => {
                const h1 = heroes1?.sort((a, b) => b.games - a.games)[idx];
                const h2 = heroes2?.sort((a, b) => b.games - a.games)[idx];
                
                return (
                  <GlassCard key={idx} className="p-6 flex items-center justify-between group hover:bg-[var(--nav-hover)] transition-all">
                    {/* Hero 1 */}
                    <div className="flex-1 flex items-center gap-4">
                      {h1 ? (
                        <>
                          <img 
                            src={getHeroImageUrl(Number(h1.hero_id))} 
                            className="w-16 h-16 rounded-xl border-2 border-[var(--card-border)] group-hover:border-purple-500/50 transition-colors"
                            alt="Hero"
                          />
                          <div>
                            <p className="text-xl font-black italic">{(h1.win / h1.games * 100).toFixed(0)}% WR</p>
                            <p className="text-foreground/40 text-xs font-bold">{h1.games} games</p>
                          </div>
                        </>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-white/5" />
                      )}
                    </div>

                    <div className="px-8 text-foreground/20 font-black text-2xl italic">#{idx + 1}</div>

                    {/* Hero 2 */}
                    <div className="flex-1 flex items-center justify-end gap-4 text-right">
                      {h2 ? (
                        <>
                          <div>
                            <p className="text-xl font-black italic">{(h2.win / h2.games * 100).toFixed(0)}% WR</p>
                            <p className="text-foreground/40 text-xs font-bold">{h2.games} games</p>
                          </div>
                          <img 
                            src={getHeroImageUrl(Number(h2.hero_id))} 
                            className="w-16 h-16 rounded-xl border-2 border-[var(--card-border)] group-hover:border-purple-500/50 transition-colors"
                            alt="Hero"
                          />
                        </>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-[var(--nav-hover)]" />
                      )}
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-32 flex flex-col items-center justify-center text-center space-y-8">
          <div className="w-24 h-24 rounded-full bg-[var(--nav-hover)] flex items-center justify-center">
            <BarChart2 className="w-12 h-12 text-foreground/20" />
          </div>
          <div className="max-w-md space-y-2">
            <h3 className="text-2xl font-black uppercase italic">Ready to Compare?</h3>
            <p className="text-foreground/40 font-bold">Select two players from your friends list or search to see how they stack up against each other.</p>
          </div>
          <Button 
            onClick={() => handleOpenSelect('p1')}
            size="lg" 
            className="px-12 py-6 text-lg font-black italic uppercase tracking-widest bg-purple-600 hover:bg-purple-500 shadow-xl shadow-purple-500/20"
          >
            Browse Players
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto py-20 flex flex-col items-center">
         <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}
