'use client';

import React, { useState } from 'react';
import { usePlannerStore } from '@/lib/store/usePlannerStore';
import { Truck, Sliders, ChevronDown, Check } from 'lucide-react';

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
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-sky-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Dispatch Vehicle & Container
          </h2>
        </div>
        <button
          onClick={() => {
            selectVehicle('custom-vehicle');
            setIsCustomOpen(true);
          }}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg border transition-all ${
            isCustom
              ? 'bg-sky-500/20 border-sky-400 text-sky-300'
              : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:text-white hover:border-slate-600'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Custom Dimensions</span>
        </button>
      </div>

      {/* Preset Vehicles Pills */}
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
              className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all relative ${
                active
                  ? 'bg-sky-950/60 border-sky-500 shadow-sm'
                  : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
              }`}
            >
              {active && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center text-slate-950">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
              <span className={`text-xs font-semibold truncate w-full ${active ? 'text-sky-300' : 'text-slate-200'}`}>
                {v.name.split('/')[0]}
              </span>
              <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                {(v.length / 1000).toFixed(1)}m × {(v.width / 1000).toFixed(1)}m
              </span>
              <span className="text-[10px] text-slate-500 mt-1">
                Cap: {(v.maxPayloadKg / 1000).toFixed(1)}T
              </span>
            </button>
          );
        })}
      </div>

      {/* Custom Vehicle Inputs Drawer */}
      {isCustom && (
        <div className="bg-slate-950/70 border border-sky-500/30 p-3.5 rounded-xl mt-3 space-y-3">
          <div className="text-xs font-medium text-sky-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            <span>Custom Bed Parameters (in millimeters & kilograms)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Length (mm)</label>
              <input
                type="number"
                min="1000"
                step="100"
                value={customVehicle.length}
                onChange={(e) => updateCustomVehicle({ length: Number(e.target.value) || 1000 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Width (mm)</label>
              <input
                type="number"
                min="500"
                step="50"
                value={customVehicle.width}
                onChange={(e) => updateCustomVehicle({ width: Number(e.target.value) || 500 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Max Height (mm)</label>
              <input
                type="number"
                min="500"
                step="50"
                value={customVehicle.height}
                onChange={(e) => updateCustomVehicle({ height: Number(e.target.value) || 500 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Max Payload (kg)</label>
              <input
                type="number"
                min="500"
                step="500"
                value={customVehicle.maxPayloadKg}
                onChange={(e) => updateCustomVehicle({ maxPayloadKg: Number(e.target.value) || 500 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Current Vehicle Badge Summary */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
        <div>
          Active Vehicle:{' '}
          <span className="font-semibold text-slate-200">{selectedVehicle.name}</span>
        </div>
        <div className="font-mono text-slate-300">
          Internal: {selectedVehicle.length} × {selectedVehicle.width} × {selectedVehicle.height} mm
          &nbsp;| Payload Cap: {selectedVehicle.maxPayloadKg.toLocaleString()} kg
        </div>
      </div>
    </div>
  );
};
