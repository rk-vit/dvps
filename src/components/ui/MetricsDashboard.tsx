'use client';

import React from 'react';
import { usePlannerStore } from '@/lib/store/usePlannerStore';
import { Box, Weight, Gauge, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export const MetricsDashboard: React.FC = () => {
  const { packingResult, selectedVehicle } = usePlannerStore();

  if (!packingResult) return null;

  const {
    volumeUtilizationPercent,
    totalCargoVolumeM3,
    vehicleVolumeM3,
    weightUtilizationPercent,
    totalCargoWeightKg,
    maxPayloadKg,
    centerOfGravity,
    totalPackedItemsCount,
    totalUnplacedItemsCount,
    calculationTimeMs,
  } = packingResult;

  const isWeightOverload = totalCargoWeightKg > maxPayloadKg;
  const isLateralOff = centerOfGravity.isLaterallyImbalanced;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* 1. Volumetric Utilization */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Volume Utilization
          </span>
          <Box className="w-4 h-4 text-sky-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-white">
            {volumeUtilizationPercent}%
          </span>
          <span className="text-xs text-slate-400">
            ({totalCargoVolumeM3} / {vehicleVolumeM3} m³)
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-sky-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, volumeUtilizationPercent)}%` }}
          />
        </div>
      </div>

      {/* 2. Weight / Payload Utilization */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Payload Weight
          </span>
          <Weight
            className={`w-4 h-4 ${isWeightOverload ? 'text-rose-400' : 'text-emerald-400'}`}
          />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span
            className={`text-2xl font-bold font-mono ${
              isWeightOverload ? 'text-rose-400' : 'text-white'
            }`}
          >
            {weightUtilizationPercent}%
          </span>
          <span className="text-xs text-slate-400">
            ({(totalCargoWeightKg / 1000).toFixed(1)} / {(maxPayloadKg / 1000).toFixed(1)} T)
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isWeightOverload ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, weightUtilizationPercent)}%` }}
          />
        </div>
      </div>

      {/* 3. Axle Balance & Stability */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Axle Balance & CoG
          </span>
          <Gauge className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-center justify-between text-xs font-mono text-slate-300">
          <span>Front: {Math.round(centerOfGravity.frontAxleRatio * 100)}%</span>
          <span>Rear: {Math.round(centerOfGravity.rearAxleRatio * 100)}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 flex overflow-hidden">
          <div
            className="h-full bg-amber-400/80 transition-all"
            style={{ width: `${centerOfGravity.frontAxleRatio * 100}%` }}
          />
          <div
            className="h-full bg-sky-400/80 transition-all"
            style={{ width: `${centerOfGravity.rearAxleRatio * 100}%` }}
          />
        </div>
        <div className="text-[10px] mt-1 text-slate-400 truncate">
          {isLateralOff ? (
            <span className="text-amber-400 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 inline" /> Lateral tilt: {centerOfGravity.yPercent}%
            </span>
          ) : (
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 inline" /> Axle & Lateral distribution safe
            </span>
          )}
        </div>
      </div>

      {/* 4. Pack Status & Solver Speed */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Packing Status
          </span>
          <Clock className="w-4 h-4 text-sky-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-emerald-400">
            {totalPackedItemsCount}
          </span>
          <span className="text-xs text-slate-400">units loaded</span>
          {totalUnplacedItemsCount > 0 && (
            <span className="text-xs font-semibold text-rose-400 ml-1">
              ({totalUnplacedItemsCount} unplaced)
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
          <span>Engine Time:</span>
          <span className="font-mono text-sky-400">{calculationTimeMs} ms</span>
        </div>
      </div>
    </div>
  );
};
