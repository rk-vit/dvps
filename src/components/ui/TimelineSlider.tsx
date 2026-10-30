'use client';

import React, { useEffect } from 'react';
import { usePlannerStore } from '@/lib/store/usePlannerStore';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

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
      setActiveStep(
        activeStep >= totalSteps ? 1 : activeStep + 1
      );
    }, playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, activeStep, totalSteps, playbackSpeed, setActiveStep]);

  const currentPlacedItem = packingResult?.placedItems.find(
    (item) => item.stepNumber === activeStep
  );

  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
      {/* Top Header: Step Counter & Quick Jump */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            3D Loading Sequence
          </span>
          <span className="px-2 py-0.5 rounded-full bg-sky-950 border border-sky-500/40 text-sky-400 font-mono text-xs font-bold">
            Step {activeStep} / {totalSteps}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => {
              setIsPlaying(false);
              setActiveStep(0);
            }}
            className="text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-800 transition"
          >
            Empty Bed
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setActiveStep(totalSteps);
            }}
            className="text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-800 transition"
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
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500 hover:accent-sky-400 focus:outline-none"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
          <span>0 (Empty)</span>
          <span>50% Loaded</span>
          <span>{totalSteps} (Complete)</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        {/* Playback Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setIsPlaying(false);
              setActiveStep(0);
            }}
            title="Reset to beginning"
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setActiveStep(Math.max(0, activeStep - 1));
            }}
            title="Previous item"
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition shadow-sm"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-slate-950" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
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
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-400 mr-1 text-[11px]">Speed:</span>
          {[
            { label: '0.5x', ms: 1200 },
            { label: '1x', ms: 700 },
            { label: '2x', ms: 350 },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => setPlaybackSpeed(s.ms)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                playbackSpeed === s.ms
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Active Step Details Pill */}
        {currentPlacedItem ? (
          <div className="w-full sm:w-auto text-xs bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-lg flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentPlacedItem.color }} />
            <span className="font-medium text-white truncate max-w-[180px]">
              {currentPlacedItem.name}
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              ({currentPlacedItem.dimensions.length}×{currentPlacedItem.dimensions.width}×{currentPlacedItem.dimensions.height}mm)
            </span>
          </div>
        ) : (
          <div className="text-xs text-slate-500 italic">
            {activeStep === 0 ? 'Vehicle bed empty. Press Play to start loading.' : ''}
          </div>
        )}
      </div>
    </div>
  );
};
