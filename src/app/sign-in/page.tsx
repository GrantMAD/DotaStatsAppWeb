'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

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
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Welcome Back</h1>
          <p className="text-white/40 font-bold uppercase text-xs tracking-widest">Sign in to your DotaApp account</p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-6 relative">
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
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Sign In'}
          </Button>
        </form>

        <div className="relative text-center">
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest">
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="text-purple-400 hover:text-purple-300 transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
