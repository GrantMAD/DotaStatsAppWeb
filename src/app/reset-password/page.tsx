'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Lock, Loader2, Eye, EyeOff } from '@/components/ui/Icons';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.push('/sign-in');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0c]">
      <GlassCard className="w-full max-w-md p-8 space-y-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 blur-[100px] rounded-full" />

        <div className="relative space-y-2">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">New Password</h1>
          <p className="text-white/40 font-bold uppercase text-xs tracking-widest">Update your account credentials</p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl space-y-4 text-center">
            <p className="text-green-400 font-bold text-lg">Password Updated!</p>
            <p className="text-white/60 text-sm">Your password has been changed successfully. Redirecting you to sign in...</p>
            <Button onClick={() => router.push('/sign-in')} className="w-full bg-green-600 hover:bg-green-500">
              Go to Sign In Now
            </Button>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-6 relative">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-white/40 text-[10px] font-black uppercase tracking-widest ml-1">New Password</label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-purple-500 transition-colors pointer-events-none z-10" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-10 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-white/40 text-[10px] font-black uppercase tracking-widest ml-1">Confirm New Password</label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-purple-500 transition-colors pointer-events-none z-10" />
                </div>
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full py-6 text-lg font-black italic uppercase tracking-widest bg-purple-600 hover:bg-purple-500 shadow-xl shadow-purple-500/20"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Update Password'}
            </Button>
          </form>
        )}
      </GlassCard>
    </div>
  );
}
