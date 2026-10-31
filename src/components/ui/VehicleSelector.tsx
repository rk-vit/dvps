'use client';

import React, { useState } from 'react';
import { usePlannerStore } from '@/lib/store/usePlannerStore';
import { Sliders, Check } from 'lucide-react';

export const VehicleSelector: React.FC = () => {
  const {
    vehicles,
    selectedVehicleId,
    selectedVehicle,
    customVehicle,
    selectVehicle,
    updateCustomVehicle,
  } = usePlannerStore();

  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const isCustom = selectedVehicleId === 'custom-vehicle';

  return (
    <div className="bg-card border border-border p-4 rounded-xl shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs tracking-wider uppercase font-semibold text-foreground">
            Transport Fleet & Container
          </span>
        </div>
        <button
          onClick={() => {
            selectVehicle('custom-vehicle');
            setIsCustomOpen(!isCustomOpen);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition shadow-xs ${
            isCustom
              ? 'border-foreground bg-foreground text-background'
              : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-neutral-400 dark:hover:border-neutral-600'
          }`}
        >
          <Sliders className="w-3 h-3 stroke-[2]" />
          <span>Custom Dimensions</span>
        </button>
      </div>

      {/* Preset Vehicles Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-3">
        {vehicles.map((v) => {
          const active = selectedVehicleId === v.id;
          return (
            <button
              key={v.id}
              onClick={() => {
                selectVehicle(v.id);
                setIsCustomOpen(false);
              }}
              className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition relative shadow-xs ${
                active
                  ? 'border-foreground bg-muted/70 ring-1 ring-foreground/20'
                  : 'border-border bg-card hover:bg-muted/40 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              {active && (
                <div className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-foreground flex items-center justify-center text-background">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
              <span className={`text-xs font-semibold truncate w-full ${active ? 'text-foreground' : 'text-neutral-700 dark:text-neutral-300'}`}>
                {v.name.split('/')[0]}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono mt-0.5">
                {(v.length / 1000).toFixed(1)}m × {(v.width / 1000).toFixed(1)}m
              </span>
              <span className="text-[10px] text-muted-foreground mt-1 font-mono">
                Payload: {(v.maxPayloadKg / 1000).toFixed(1)}T
              </span>
            </button>
          );
        })}
      </div>

      {/* Custom Vehicle Inputs Drawer */}
      {isCustom && (
        <div className="bg-muted/40 border border-border p-3 rounded-lg mt-3 space-y-3">
          <div className="text-xs font-medium text-foreground flex items-center gap-1.5 font-mono">
            <span>Custom Bed Parameters (in millimeters & kilograms)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div>
              <label className="block text-muted-foreground text-[11px] mb-1 font-mono">Length (mm)</label>
              <input
                type="number"
                min="1000"
                step="100"
                value={customVehicle.length}
                onChange={(e) => updateCustomVehicle({ length: Number(e.target.value) || 1000 })}
                className="w-full bg-card border border-border rounded-md px-2.5 py-1.5 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-foreground transition"
              />
            </div>
            <div>
              <label className="block text-muted-foreground text-[11px] mb-1 font-mono">Width (mm)</label>
              <input
                type="number"
                min="500"
                step="50"
                value={customVehicle.width}
                onChange={(e) => updateCustomVehicle({ width: Number(e.target.value) || 500 })}
                className="w-full bg-card border border-border rounded-md px-2.5 py-1.5 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-foreground transition"
              />
            </div>
            <div>
              <label className="block text-muted-foreground text-[11px] mb-1 font-mono">Max Height (mm)</label>
              <input
                type="number"
                min="500"
                step="50"
                value={customVehicle.height}
                onChange={(e) => updateCustomVehicle({ height: Number(e.target.value) || 500 })}
                className="w-full bg-card border border-border rounded-md px-2.5 py-1.5 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-foreground transition"
              />
            </div>
            <div>
              <label className="block text-muted-foreground text-[11px] mb-1 font-mono">Max Payload (kg)</label>
              <input
                type="number"
                min="500"
                step="500"
                value={customVehicle.maxPayloadKg}
                onChange={(e) => updateCustomVehicle({ maxPayloadKg: Number(e.target.value) || 500 })}
                className="w-full bg-card border border-border rounded-md px-2.5 py-1.5 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-foreground transition"
              />
            </div>
          </div>
        </div>
      )}

      {/* Current Vehicle Badge Summary */}
      <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-2.5 border-t border-border font-mono text-[11px]">
        <div>
          Active: <span className="font-semibold text-foreground">{selectedVehicle.name}</span>
        </div>
        <div>
          {selectedVehicle.length} × {selectedVehicle.width} × {selectedVehicle.height} mm
          &nbsp;| Cap: {selectedVehicle.maxPayloadKg.toLocaleString()} kg
        </div>
      </div>
    </div>
  );
};
