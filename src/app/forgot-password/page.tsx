'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Mail, Loader2 } from '@/components/ui/Icons';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0c]">
      <div className="absolute top-8 left-8">
        <Link href="/sign-in">
          <Button variant="ghost" className="gap-2 text-white/50 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Button>
        </Link>
      </div>

      <GlassCard className="w-full max-w-md p-8 space-y-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 blur-[100px] rounded-full" />

        <div className="relative space-y-2">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Reset Password</h1>
          <p className="text-white/40 font-bold uppercase text-xs tracking-widest">Receive a recovery link via email</p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl space-y-4">
            <p className="text-green-400 font-bold">Check your email!</p>
            <p className="text-white/60 text-sm">We&apos;ve sent a password reset link to <span className="text-white">{email}</span>.</p>
            <Link href="/sign-in" className="block">
              <Button className="w-full bg-green-600 hover:bg-green-500">Return to Sign In</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6 relative">
            <div className="space-y-2">
              <label className="text-white/40 text-[10px] font-black uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-purple-500 transition-colors pointer-events-none z-10" />
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full py-6 text-lg font-black italic uppercase tracking-widest bg-purple-600 hover:bg-purple-500 shadow-xl shadow-purple-500/20"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Send Recovery Link'}
            </Button>
          </form>
        )}
      </GlassCard>
    </div>
  );
}
