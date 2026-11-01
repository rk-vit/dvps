'use client';

import React from 'react';
import { CameraPreset, usePlannerStore } from '@/lib/store/usePlannerStore';
import { Eye, Layers, Compass, Sparkles } from 'lucide-react';

export const ViewControls: React.FC = () => {
  const {
    cameraView,
    setCameraView,
    showContainerWalls,
    toggleContainerWalls,
    showCoGIndicator,
    toggleCoGIndicator,
    cutawayHeightPercent,
    setCutawayHeightPercent,
  } = usePlannerStore();

  const presets: { id: CameraPreset; label: string }[] = [
    { id: 'isometric', label: '3D Orbit' },
    { id: 'top', label: 'Top (Plan)' },
    { id: 'side', label: 'Side' },
    { id: 'rear', label: 'Rear Doors' },
  ];

  return (
    <div className="absolute top-3 left-3 right-3 sm:right-auto z-10 flex items-center gap-1.5 bg-card/90 dark:bg-card/85 backdrop-blur-md border border-border p-1.5 rounded-xl shadow-xs text-xs text-foreground transition-colors overflow-x-auto max-w-[calc(100%-24px)] no-scrollbar">
      {/* Camera Angle Segment Controls */}
      <div className="flex items-center gap-0.5 bg-muted p-0.5 rounded-lg">
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => setCameraView(p.id)}
            className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-medium transition ${
              cameraView === p.id
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="h-4 w-px bg-border mx-0.5 hidden sm:block" />

      {/* Wall Enclosure Toggle */}
      <button
        onClick={toggleContainerWalls}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono transition ${
          showContainerWalls
            ? 'bg-muted border-border text-foreground font-semibold'
            : 'border-transparent text-muted-foreground hover:text-foreground'
        }`}
        title="Toggle container frame wireframe"
      >
        <Eye className="w-3 h-3 stroke-[2]" />
        <span>Cage</span>
      </button>

      {/* Center of Gravity Toggle */}
      <button
        onClick={toggleCoGIndicator}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono transition ${
          showCoGIndicator
            ? 'bg-muted border-border text-foreground font-semibold'
            : 'border-transparent text-muted-foreground hover:text-foreground'
        }`}
        title="Toggle Center of Gravity balance indicator"
      >
        <Sparkles className="w-3 h-3 stroke-[2]" />
        <span>CoG</span>
      </button>

      {/* Height Cutaway / Slice Slider */}
      <div className="flex items-center gap-2 bg-muted/60 px-2.5 py-1 rounded-md text-[11px] font-mono">
        <Layers className="w-3 h-3 text-muted-foreground" />
        <span className="text-muted-foreground">Slice: {cutawayHeightPercent}%</span>
        <input
          type="range"
          min="10"
          max="100"
          value={cutawayHeightPercent}
          onChange={(e) => setCutawayHeightPercent(Number(e.target.value))}
          className="w-14 h-1 accent-foreground cursor-pointer"
          title="Filter items by height"
        />
      </div>
    </div>
  );
};
