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
    { id: 'top', label: 'Top View' },
    { id: 'side', label: 'Side Profile' },
    { id: 'rear', label: 'Rear Doors' },
  ];

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 p-2 rounded-xl shadow-xl text-xs text-white">
      {/* Camera Angle Buttons */}
      <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/50">
        <Compass className="w-3.5 h-3.5 text-sky-400 mr-1" />
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => setCameraView(p.id)}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              cameraView === p.id
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="h-5 w-px bg-slate-700 mx-1 hidden sm:block" />

      {/* Wall Enclosure Toggle */}
      <button
        onClick={toggleContainerWalls}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
          showContainerWalls
            ? 'bg-slate-800 border-sky-500/60 text-sky-300'
            : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
        }`}
        title="Toggle container enclosure wireframe"
      >
        <Eye className="w-3.5 h-3.5" />
        <span>Walls</span>
      </button>

      {/* Center of Gravity Toggle */}
      <button
        onClick={toggleCoGIndicator}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
          showCoGIndicator
            ? 'bg-slate-800 border-emerald-500/60 text-emerald-300'
            : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
        }`}
        title="Toggle Center of Gravity marker"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>CoG Marker</span>
      </button>

      {/* Height Cutaway / X-Ray Slider */}
      <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/50">
        <Layers className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-slate-300">Slice: {cutawayHeightPercent}%</span>
        <input
          type="range"
          min="10"
          max="100"
          value={cutawayHeightPercent}
          onChange={(e) => setCutawayHeightPercent(Number(e.target.value))}
          className="w-16 h-1.5 accent-amber-400 cursor-pointer bg-slate-700 rounded-lg"
          title="Filter items by height"
        />
      </div>
    </div>
  );
};
