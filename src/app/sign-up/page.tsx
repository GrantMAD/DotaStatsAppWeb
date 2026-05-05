'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0c]">
        <GlassCard className="w-full max-w-md p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Check your email</h1>
          <p className="text-white/40 font-bold">We&apos;ve sent a confirmation link to <span className="text-white">{email}</span>. Please verify your account to continue.</p>
          <Link href="/sign-in">
            <Button variant="ghost" className="mt-4">Back to Sign In</Button>
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0c]">
      <div className="absolute top-8 left-8">
        <Link href="/">
          <Button variant="ghost" className="gap-2 text-white/50 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </Link>
      </div>

      <GlassCard className="w-full max-w-md p-8 space-y-8 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/10 blur-[100px] rounded-full" />

        <div className="relative space-y-2">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Join DotaApp</h1>
          <p className="text-white/40 font-bold uppercase text-xs tracking-widest">Create your account to start tracking</p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-6 relative">
          <div className="space-y-4">
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

            <div className="space-y-2">
              <label className="text-white/40 text-[10px] font-black uppercase tracking-widest ml-1">Password</label>
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
          </div>

          <Button 
            type="submit"
            disabled={loading}
            className="w-full py-6 text-lg font-black italic uppercase tracking-widest bg-purple-600 hover:bg-purple-500 shadow-xl shadow-purple-500/20"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Create Account'}
          </Button>
        </form>

        <div className="relative text-center">
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-purple-400 hover:text-purple-300 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
