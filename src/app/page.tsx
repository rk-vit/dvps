'use client';

import React, { useState } from 'react';
import { usePlannerStore } from '@/lib/store/usePlannerStore';
import { LoadingScene3D } from '@/components/3d/LoadingScene3D';
import { VehicleSelector } from '@/components/ui/VehicleSelector';
import { MetricsDashboard } from '@/components/ui/MetricsDashboard';
import { CargoCatalog } from '@/components/ui/CargoCatalog';
import { TimelineSlider } from '@/components/ui/TimelineSlider';
import { ManifestDrawer } from '@/components/ui/ManifestDrawer';
import {
  Boxes,
  Truck,
  RotateCw,
  FileSpreadsheet,
  Code2,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';

export default function DispatchPlannerPage() {
  const { runPackingOptimization, isCalculating, packingResult } = usePlannerStore();
  const [isManifestOpen, setIsManifestOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* 1. Global Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-6 py-3">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between">
          {/* Brand Logo & Titles */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Truck className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white">
                  SPEARHEAD 3D DISPATCH
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  v1.0 CLP Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Industrial Vehicle Sizing & 3D Packing Optimization System
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2.5">
            {/* API Routes Info Button */}
            <button
              onClick={() => setIsApiModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition"
              title="View REST API specifications (/api/pack)"
            >
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">API Endpoints</span>
            </button>

            {/* Print / Export Loading Manifest */}
            <button
              onClick={() => setIsManifestOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Dispatch Manifest</span>
            </button>

            {/* Run Re-Optimization Button */}
            <button
              onClick={() => runPackingOptimization()}
              disabled={isCalculating}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition shadow-md shadow-sky-500/20 disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
              <span>{isCalculating ? 'Computing...' : 'Optimize Pack'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Application Workspace */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 lg:p-6 space-y-4">
        {/* Top Section: Vehicle Selector + Metrics Dashboard */}
        <section className="space-y-3">
          <VehicleSelector />
          <MetricsDashboard />
        </section>

        {/* Center Grid: Catalog (Left) + 3D Simulation Canvas & Step Timeline (Right) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column: Cargo Items Catalog (4 cols on desktop) */}
          <div className="lg:col-span-4 h-full">
            <CargoCatalog />
          </div>

          {/* Right Column: 3D Scene + Timeline Controls (8 cols on desktop) */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            {/* 3D Simulation Viewport */}
            <div className="w-full h-[520px] rounded-2xl overflow-hidden">
              <LoadingScene3D />
            </div>

            {/* Step-by-Step Loading Scrub Timeline */}
            <TimelineSlider />
          </div>
        </section>
      </main>

      {/* 3. Printable Manifest Drawer Modal */}
      <ManifestDrawer isOpen={isManifestOpen} onClose={() => setIsManifestOpen(false)} />

      {/* 4. API Documentation Modal (for Developer Integration) */}
      {isApiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl p-6 rounded-2xl shadow-2xl text-slate-200 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-sm text-white">
                  Developer Integration & API Route Specifications
                </h3>
              </div>
              <button
                onClick={() => setIsApiModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-300">
              You can consume the 3D packing engine directly via Next.js API routes or import it as a pure module:
            </p>

            <div className="space-y-2">
              <div className="font-semibold text-sky-300">
                POST <code className="bg-slate-950 px-2 py-0.5 rounded text-sky-400">/api/pack</code>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] overflow-x-auto text-slate-300">
                <pre>{`// Request Body (JSON):
{
  "vehicle": {
    "id": "truck-1",
    "name": "Custom Vehicle",
    "length": 6000,    // mm
    "width": 2400,     // mm
    "height": 2400,    // mm
    "maxPayloadKg": 10000
  },
  "items": [
    {
      "id": "part-1",
      "name": "Precast Column",
      "length": 2000,
      "width": 600,
      "height": 600,
      "weight": 800,
      "quantity": 3,
      "orientation": "lengthwise",
      "allowStackAbove": true,
      "maxWeightOnTopKg": 2000
    }
  ]
}`}</pre>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-emerald-300">Response:</div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] overflow-x-auto text-slate-300">
                <pre>{`{
  "success": true,
  "result": {
    "placedItems": [
      {
        "id": "part-1-1",
        "name": "Precast Column",
        "dimensions": { "length": 2000, "width": 600, "height": 600 },
        "position": { "x": 0, "y": 0, "z": 0 },
        "stepNumber": 1,
        "supportedAreaPercent": 100
      }
    ],
    "volumeUtilizationPercent": 76.5,
    "weightUtilizationPercent": 84.0,
    "centerOfGravity": { "x": 2450, "y": 1200, "z": 450, "frontAxleRatio": 0.52 }
  }
}`}</pre>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsApiModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        Spearhead 3D Dispatch Vehicle Planner • Extreme Points (EP) Heuristic Engine • React Three Fiber 3D Simulation
      </footer>
    </div>
  );
}
