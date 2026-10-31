'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePlannerStore } from '@/lib/store/usePlannerStore';
import { useAuthGuard } from '@/lib/auth/useAuthGuard';
import { LoadingScene3D } from '@/components/3d/LoadingScene3D';
import { VehicleSelector } from '@/components/ui/VehicleSelector';
import { MetricsDashboard } from '@/components/ui/MetricsDashboard';
import { CargoCatalog } from '@/components/ui/CargoCatalog';
import { TimelineSlider } from '@/components/ui/TimelineSlider';
import { ManifestDrawer } from '@/components/ui/ManifestDrawer';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import {
  RotateCw,
  FileSpreadsheet,
  LogOut,
  User,
  ArrowLeft,
  Calendar,
  MapPin,
} from 'lucide-react';

function PlannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthorized } = useAuthGuard();

  const {
    runPackingOptimization,
    isCalculating,
    currentUser,
    logout,
    activePlan,
    loadPlan,
  } = usePlannerStore();

  const [isManifestOpen, setIsManifestOpen] = useState(false);

  // If planId query param is present, load that plan
  useEffect(() => {
    const planId = searchParams.get('planId');
    if (planId) {
      loadPlan(planId);
    }
  }, [searchParams, loadPlan]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-mono text-xs">
        <div className="flex items-center gap-2">
          <RotateCw className="w-4 h-4 animate-spin text-accent" />
          <span>Validating Axion Operator Session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      {/* 1. Global Navigation Bar */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-2.5">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between">
          {/* Back Button & Brand Wordmark */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted text-foreground transition shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Plans</span>
            </Link>

            <div className="h-4 w-px bg-border hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="font-mono text-sm tracking-widest uppercase font-bold text-foreground">
                DVPS
              </span>
              <span className="text-muted-foreground text-xs font-mono">•</span>
              <span className="text-xs font-semibold text-muted-foreground font-mono">
                DISPATCH VEHICLE PLANNING SYSTEM
              </span>
              {activePlan && (
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-muted text-foreground border border-border font-semibold">
                  <span>{activePlan.code}:</span>
                  <span className="text-muted-foreground truncate max-w-[180px]">{activePlan.name}</span>
                </span>
              )}
            </div>
          </div>

          {/* Action Tools & User Profile */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            <div className="h-4 w-px bg-border mx-0.5 hidden sm:block" />

            {/* Print / Export Loading Manifest */}
            <button
              onClick={() => setIsManifestOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted text-foreground transition shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 stroke-[2]" />
              <span>Loading Manifest</span>
            </button>

            {/* Run Optimization Button */}
            <button
              onClick={() => runPackingOptimization()}
              disabled={isCalculating}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-foreground text-background hover:opacity-90 transition shadow-xs disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 stroke-[2] ${isCalculating ? 'animate-spin' : ''}`} />
              <span>{isCalculating ? 'Computing...' : 'Optimize Pack'}</span>
            </button>

            <div className="h-4 w-px bg-border mx-0.5 hidden sm:block" />

            {/* User Profile / Auth State */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-1">
                <div className="hidden xl:block text-right">
                  <div className="text-xs font-semibold text-foreground leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    {currentUser.role}
                  </div>
                </div>

                <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center text-foreground font-mono text-xs font-semibold">
                  <User className="w-3.5 h-3.5" />
                </div>

                <button
                  onClick={() => {
                    logout();
                    router.push('/login');
                  }}
                  title="Sign out of dispatch terminal"
                  className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-muted transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Workbench Content Area */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 lg:p-6 space-y-4">
        {/* Top: Vehicle Fleet Sizing & Presets Selector */}
        <VehicleSelector />

        {/* Upper Middle: Real-time Physics & Optimization KPIs */}
        <MetricsDashboard />

        {/* Lower Section: Split Viewport Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start min-h-[580px]">
          {/* Left Column (4 cols): Cargo Items Catalog */}
          <div className="lg:col-span-4 h-full min-h-[540px]">
            <CargoCatalog />
          </div>

          {/* Right Column (8 cols): Interactive 3D Canvas Viewport */}
          <div className="lg:col-span-8 flex flex-col gap-3 h-full">
            <div className="flex-1 min-h-[500px]">
              <LoadingScene3D />
            </div>

            {/* Loading Playback & Step Sequence Controller */}
            <TimelineSlider />
          </div>
        </div>
      </main>

      {/* Manifest Modal Drawer */}
      <ManifestDrawer isOpen={isManifestOpen} onClose={() => setIsManifestOpen(false)} />
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-mono text-xs">
          Loading Planner...
        </div>
      }
    >
      <PlannerContent />
    </Suspense>
  );
}
