'use client';

import React, { useEffect } from 'react';
import { usePlannerStore } from '@/lib/store/usePlannerStore';
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

export const TimelineSlider: React.FC = () => {
  const {
    packingResult,
    activeStep,
    setActiveStep,
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
  } = usePlannerStore();

  const totalSteps = packingResult?.placedItems.length || 0;

  // Auto-play step animation loop
  useEffect(() => {
    if (!isPlaying || totalSteps === 0) return;

    const interval = setInterval(() => {
      setActiveStep(activeStep >= totalSteps ? 1 : activeStep + 1);
    }, playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, activeStep, totalSteps, playbackSpeed, setActiveStep]);

  const currentPlacedItem = packingResult?.placedItems.find(
    (item) => item.stepNumber === activeStep
  );

  return (
    <div className="bg-card border border-border p-4 rounded-xl shadow-xs transition-colors">
      {/* Top Header: Step Counter & Quick Jump */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider font-mono text-foreground whitespace-nowrap">
            Loading Sequence Playback
          </span>
          <span className="px-2 py-0.5 rounded-md bg-muted text-foreground font-mono text-xs font-semibold border border-border shrink-0">
            Step {activeStep} / {totalSteps}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-[11px] self-start sm:self-auto">
          <button
            onClick={() => {
              setIsPlaying(false);
              setActiveStep(0);
            }}
            className="text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border bg-card hover:bg-muted transition"
          >
            Empty Bed
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setActiveStep(totalSteps);
            }}
            className="text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border bg-card hover:bg-muted transition"
          >
            Fully Loaded
          </button>
        </div>
      </div>

      {/* Scrub Slider */}
      <div className="relative mb-3">
        <input
          type="range"
          min="0"
          max={totalSteps}
          value={activeStep}
          onChange={(e) => {
            setIsPlaying(false);
            setActiveStep(Number(e.target.value));
          }}
          className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-foreground focus:outline-none"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-mono">
          <span>0 (Empty)</span>
          <span>50% Loaded</span>
          <span>{totalSteps} (Complete)</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-border">
        {/* Playback Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setIsPlaying(false);
              setActiveStep(0);
            }}
            title="Reset to beginning"
            className="p-1.5 rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setActiveStep(Math.max(0, activeStep - 1));
            }}
            title="Previous item"
            className="p-1.5 rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition shadow-xs"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-foreground text-background font-semibold text-xs transition shadow-xs hover:opacity-90"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Simulation</span>
              </>
            )}
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setActiveStep(Math.min(totalSteps, activeStep + 1));
            }}
            title="Next item"
            className="p-1.5 rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition shadow-xs"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1 text-xs font-mono text-[11px]">
          <span className="text-muted-foreground mr-1">Speed:</span>
          {[
            { label: '0.5x', ms: 1200 },
            { label: '1x', ms: 700 },
            { label: '2x', ms: 350 },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => setPlaybackSpeed(s.ms)}
              className={`px-2 py-0.5 rounded border transition ${
                playbackSpeed === s.ms
                  ? 'border-foreground bg-muted font-bold text-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Active Step Details */}
        {currentPlacedItem ? (
          <div className="w-full sm:w-auto text-xs bg-muted/70 border border-border px-3 py-1.5 rounded-lg flex items-center gap-2 text-foreground font-mono">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentPlacedItem.color }} />
            <span className="font-semibold truncate max-w-[160px]">{currentPlacedItem.name}</span>
            <span className="text-muted-foreground text-[11px]">
              ({currentPlacedItem.dimensions.length}×{currentPlacedItem.dimensions.width}×{currentPlacedItem.dimensions.height}mm)
            </span>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground font-mono">
            {activeStep === 0 ? 'Bed empty. Hit Play to load.' : ''}
          </div>
        )}
      </div>
    </div>
  );
};
