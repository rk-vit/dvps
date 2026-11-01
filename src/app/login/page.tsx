'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlannerStore } from '@/lib/store/usePlannerStore';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { ArrowRight, Shield, Layers, Gauge, AlertCircle, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = usePlannerStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Strict validation requirement
    if (cleanEmail === 'testuser@axion.com' && cleanPassword === 'test@2026') {
      login({
        name: 'Axion Operator',
        email: 'testuser@axion.com',
        role: 'Dispatch Operations Lead',
        facility: 'Axion Global Logistics Yard',
      });
      router.push('/');
    } else {
      setIsSubmitting(false);
      setError('Invalid credentials. Access is restricted to authorized operators only.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      {/* Top Bar with Minimal Header & Theme Toggle */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs tracking-widest uppercase font-bold text-foreground">
            DVPS
          </span>
          <span className="text-muted-foreground text-xs font-mono hidden sm:inline">•</span>
          <span className="text-xs font-semibold text-muted-foreground font-mono hidden sm:inline">
            DISPATCH VEHICLE PLANNING SYSTEM
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Split Layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 p-6 lg:p-12 items-center gap-12">
        {/* Left Column: Sign In Form */}
        <div className="lg:col-span-6 max-w-md w-full mx-auto space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Sign in to Dispatch Terminal
            </h1>
            <p className="text-xs text-muted-foreground">
              Authorized access for vehicle loading optimization and fleet manifest planning.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-xs text-red-600 dark:text-red-400 flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-foreground">Operator Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="testuser@axion.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent transition shadow-xs"
                />
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-foreground">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Enter security password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent transition shadow-xs"
                />
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Terminal'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Secure System Notice */}
          <div className="pt-2 text-[11px] text-muted-foreground font-mono flex items-center gap-1.5 justify-center">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted Session • Axion Terminal Gate</span>
          </div>
        </div>

        {/* Right Column: Architectural Highlights */}
        <div className="lg:col-span-6 bg-card border border-border rounded-2xl p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>CORE ENGINE SPECIFICATIONS • v1.0 CLP</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 text-foreground">
                <Shield className="w-4 h-4 stroke-[1.8]" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-foreground">Strict 100% Base Support</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  Four-corner validation ensures no structure cantilevers over empty space or hangs in mid-air.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 text-foreground">
                <Layers className="w-4 h-4 stroke-[1.8]" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-foreground">Extreme Points 3D Solver</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  Multi-criteria Best-Fit Decreasing heuristic computes dense cubic packings in under 5 milliseconds.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 text-foreground">
                <Gauge className="w-4 h-4 stroke-[1.8]" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-foreground">Dynamic Axle & CoG Balancing</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  Real-time longitudinal and lateral stability indicators protect vehicle weighbridges.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted/60 border border-border/70 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-muted-foreground">Security Protocol:</span>
              <span className="ml-1.5 font-semibold text-foreground">Axion Single-Tenant</span>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <span className="ml-1.5 font-semibold text-emerald-600 dark:text-emerald-400">Ready</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
