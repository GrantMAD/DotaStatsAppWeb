'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Mail, 
  Trophy, 
  List, 
  Bell, 
  Info, 
  ChevronRight, 
  LogOut, 
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Database,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { useSteamAuth } from '@/hooks/useSteamAuth';
import { createClient } from '@/utils/supabase/client';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/utils/cn';
import { useQueryClient } from '@tanstack/react-query';

interface SettingsItemProps {
  icon: React.ElementType;
  label: string;
  value?: string | boolean;
  onClick?: () => void;
  type?: 'toggle' | 'link' | 'text' | 'danger';
  color?: string;
  sublabel?: string;
}

function SettingsItem({ icon: Icon, label, value, onClick, type = 'link', color = 'text-gaming-accent', sublabel }: SettingsItemProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-4 border-b border-white/5 last:border-0 transition-colors",
        onClick ? "cursor-pointer hover:bg-white/5" : ""
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
        type === 'danger' ? "bg-red-500/10" : "bg-white/5"
      )}>
        <Icon className={cn("w-5 h-5", type === 'danger' ? "text-red-500" : color)} />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className={cn("font-bold", type === 'danger' ? "text-red-500" : "text-white")}>{label}</h3>
        {sublabel && <p className="text-gray-500 text-xs mt-0.5">{sublabel}</p>}
      </div>

      <div className="flex items-center gap-3">
        {type === 'text' && <span className="text-gray-500 text-sm font-medium">{value}</span>}
        {type === 'toggle' && (
          <div className={cn(
            "w-10 h-5 rounded-full relative transition-colors",
            value ? "bg-gaming-accent" : "bg-white/10"
          )}>
            <div className={cn(
              "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
              value ? "right-1" : "left-1"
            )} />
          </div>
        )}
        {type === 'link' && <ChevronRight className="w-5 h-5 text-gray-700" />}
      </div>
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-3 ml-1 mt-8 first:mt-0">
      {label}
    </h2>
  );
}

export default function SettingsPage() {
  const { 
    user, 
    steamAccountId, 
    matchLimit, 
    signOut, 
    refreshProfile 
  } = useSupabaseAuth();
  const { login: steamLogin, isLoading: steamLoading } = useSteamAuth();
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [isSteamModalOpen, setIsSteamModalOpen] = useState(false);
  const [storageSize, setStorageSize] = useState('0 KB');

  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    calculateStorage();
  }, []);

  const calculateStorage = () => {
    let total = 0;
    if (typeof window !== 'undefined') {
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          total += (localStorage[key].length + key.length) * 2;
        }
      }
      for (const key in sessionStorage) {
        if (Object.prototype.hasOwnProperty.call(sessionStorage, key)) {
          total += (sessionStorage[key].length + key.length) * 2;
        }
      }
    }
    setStorageSize(total < 1024 * 1024 
      ? `${(total / 1024).toFixed(1)} KB` 
      : `${(total / (1024 * 1024)).toFixed(1)} MB`
    );
  };

  const handleClearCache = (type: 'all' | 'matches' | 'profiles') => {
    switch (type) {
      case 'all':
        queryClient.clear();
        break;
      case 'matches':
        queryClient.invalidateQueries({ queryKey: ['recentMatches'] });
        queryClient.invalidateQueries({ queryKey: ['matchDetails'] });
        queryClient.invalidateQueries({ queryKey: ['playerMatches'] });
        break;
      case 'profiles':
        queryClient.invalidateQueries({ queryKey: ['playerProfile'] });
        queryClient.invalidateQueries({ queryKey: ['playerHeroesV2'] });
        queryClient.invalidateQueries({ queryKey: ['playerTotals'] });
        queryClient.invalidateQueries({ queryKey: ['playerPeersV2'] });
        break;
    }
    alert(`${type.charAt(0).toUpperCase() + type.slice(1)} cache cleared and scheduled for refetch.`);
    calculateStorage();
  };

  const handleFullReset = () => {
    if (confirm("WARNING: This will clear ALL local data and log you out. Are you sure?")) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  const handleUnlinkSteam = async () => {
    if (!user) return;
    if (confirm("Are you sure you want to unlink your Steam account? You will need to link it again to view your stats.")) {
      const { error } = await supabase
        .from('users')
        .update({ steam_account_id: null, steam_name: null })
        .eq('id', user.id);
        
      if (!error) {
        await refreshProfile();
        setIsSteamModalOpen(false);
      }
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-gaming-accent/20 rounded-2xl border border-gaming-accent/50">
          <Settings className="w-8 h-8 text-gaming-accent" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-wider">
            App <span className="text-gaming-accent">Settings</span>
          </h1>
          <p className="text-gray-400">Customize your experience and manage your account</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto pb-20">
        <SectionLabel label="Account" />
        <div className="glass-card overflow-hidden">
          <SettingsItem 
            icon={Mail} 
            label="Email" 
            value={user?.email || 'Not logged in'} 
            type="text" 
          />
          <SettingsItem 
            icon={Trophy} 
            label="Steam Connection" 
            sublabel={steamAccountId ? "Your account is linked" : "Link your account to track stats"}
            value={steamAccountId ? `ID: ${steamAccountId}` : 'Not Linked'}
            color={steamAccountId ? 'text-green-500' : 'text-gray-600'}
            onClick={() => steamAccountId ? setIsSteamModalOpen(true) : steamLogin()}
          />
        </div>

        <SectionLabel label="Preferences" />
        <div className="glass-card overflow-hidden">
          <SettingsItem 
            icon={List} 
            label="Match History Limit" 
            value={`${matchLimit} matches`}
            type="text"
            onClick={() => setIsLimitModalOpen(true)}
          />
          <SettingsItem 
            icon={Bell} 
            label="Push Notifications" 
            value={false}
            type="toggle"
            sublabel="Coming soon to web"
          />
        </div>

        <SectionLabel label="Data Management" />
        <div className="glass-card overflow-hidden">
          <SettingsItem 
            icon={HardDrive} 
            label="Local Storage Usage" 
            value={storageSize}
            type="text" 
            sublabel="Estimated size of local app data"
          />
          <SettingsItem 
            icon={RefreshCw} 
            label="Clear Matches Cache" 
            onClick={() => handleClearCache('matches')}
            sublabel="Force refresh of match history and details"
          />
          <SettingsItem 
            icon={Database} 
            label="Clear Profiles Cache" 
            onClick={() => handleClearCache('profiles')}
            sublabel="Force refresh of player and hero statistics"
          />
          <SettingsItem 
            icon={Trash2} 
            label="Full Cache Purge" 
            onClick={() => handleClearCache('all')}
            sublabel="Clear all temporary application data"
          />
          <SettingsItem 
            icon={AlertTriangle} 
            label="Reset Application Data" 
            type="danger"
            onClick={handleFullReset}
            sublabel="Clear all settings and sessions (logs you out)"
          />
        </div>

        <SectionLabel label="Support" />
        <div className="glass-card overflow-hidden">
          <SettingsItem 
            icon={Info} 
            label="App Version" 
            value="v1.0.4-beta"
            type="text" 
          />
          <SettingsItem 
            icon={List} 
            label="What's New" 
            onClick={() => alert("Changelog: \n• Ported mobile features to web\n• New Pro Scene page\n• Global & Friends Search\n• Friends & Following network\n• Integrated Steam connection")}
          />
        </div>

        <SectionLabel label="Danger Zone" />
        <div className="glass-card overflow-hidden">
          <SettingsItem 
            icon={LogOut} 
            label="Sign Out" 
            onClick={() => confirm("Are you sure you want to sign out?") && signOut()}
          />
          <SettingsItem 
            icon={Trash2} 
            label="Delete Account" 
            type="danger"
            onClick={() => alert("To delete your account, please contact support.")}
          />
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em]">
            Made by Dota fans for Dota fans
          </p>
        </div>
      </div>

      {/* Match Limit Modal */}
      <Modal 
        isOpen={isLimitModalOpen} 
        onClose={() => setIsLimitModalOpen(false)}
        title="Match History Limit"
      >
        <div className="space-y-3">
          <p className="text-gray-400 text-sm mb-6">Select how many matches to load on your profile. Higher limits may increase loading times.</p>
          {[10, 20, 50].map((option) => (
            <button
              key={option}
              onClick={async () => {
                if (!user) return;
                const { error } = await supabase
                  .from('users')
                  .update({ match_limit: option })
                  .eq('id', user.id);

                if (!error) {
                  await refreshProfile();
                  setIsLimitModalOpen(false);
                }
              }}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                matchLimit === option 
                  ? "bg-gaming-accent/10 border-gaming-accent text-white" 
                  : "bg-white/5 border-white/10 text-gray-500 hover:border-white/20 hover:text-white"
              )}
            >
              <span className="font-bold">{option} Matches</span>
              {matchLimit === option && <CheckCircle2 className="w-5 h-5 text-gaming-accent" />}
            </button>
          ))}
        </div>
      </Modal>

      {/* Steam Modal */}
      <Modal 
        isOpen={isSteamModalOpen} 
        onClose={() => setIsSteamModalOpen(false)}
        title="Steam Connection"
      >
        <div className="flex flex-col items-center text-center p-4">
          <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center mb-6 border border-green-500/20 shadow-lg shadow-green-500/10">
            <Trophy className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2 italic">ACCOUNT CONNECTED</h3>
          <p className="text-gray-400 mb-8 max-w-xs">Your Steam account (ID: {steamAccountId}) is successfully linked to your DotaApp profile.</p>
          
          <div className="w-full space-y-3">
            <button
              onClick={() => {
                setIsSteamModalOpen(false);
                steamLogin();
              }}
              className="w-full py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              Change Account
            </button>
            <button
              onClick={handleUnlinkSteam}
              className="w-full py-4 bg-red-500/10 border border-red-500/20 rounded-xl font-bold text-red-500 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Unlink Account
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
