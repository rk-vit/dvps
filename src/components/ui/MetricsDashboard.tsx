'use client';

import React from 'react';
import { usePlannerStore } from '@/lib/store/usePlannerStore';
import { Box, Weight, Gauge, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export const MetricsDashboard: React.FC = () => {
  const { packingResult, setUnplacedModalOpen } = usePlannerStore();

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
      {/* 1. Volumetric Space Utilization */}
      <div className="bg-card border border-border p-3.5 sm:p-4 rounded-xl shadow-xs transition-colors">
        <div className="flex items-center justify-between text-muted-foreground text-xs mb-1.5">
          <span className="font-mono tracking-wider uppercase text-[11px]">Volume Utilization</span>
          <Box className="w-3.5 h-3.5 stroke-[1.8]" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {volumeUtilizationPercent}%
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {totalCargoVolumeM3} / {vehicleVolumeM3} m³
          </span>
        </div>
        <div className="w-full h-1 bg-muted rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, volumeUtilizationPercent)}%` }}
          />
        </div>
      </div>

      {/* 2. Payload Weight Utilization */}
      <div className="bg-card border border-border p-3.5 sm:p-4 rounded-xl shadow-xs transition-colors">
        <div className="flex items-center justify-between text-muted-foreground text-xs mb-1.5">
          <span className="font-mono tracking-wider uppercase text-[11px]">Payload Weight</span>
          <Weight className="w-3.5 h-3.5 stroke-[1.8]" />
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-2xl font-bold font-mono tracking-tight ${
              isWeightOverload ? 'text-red-600 dark:text-red-400' : 'text-foreground'
            }`}
          >
            {weightUtilizationPercent}%
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {(totalCargoWeightKg / 1000).toFixed(1)} / {(maxPayloadKg / 1000).toFixed(1)} T
          </span>
        </div>
        <div className="w-full h-1 bg-muted rounded-full mt-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isWeightOverload ? 'bg-red-500' : 'bg-emerald-600 dark:bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, weightUtilizationPercent)}%` }}
          />
        </div>
      </div>

      {/* 3. Axle Balance & Stability */}
      <div className="bg-card border border-border p-3.5 sm:p-4 rounded-xl shadow-xs transition-colors">
        <div className="flex items-center justify-between text-muted-foreground text-xs mb-1.5">
          <span className="font-mono tracking-wider uppercase text-[11px]">Axle Distribution</span>
          <Gauge className="w-3.5 h-3.5 stroke-[1.8]" />
        </div>
        <div className="flex items-center justify-between text-xs font-mono text-foreground font-semibold">
          <span>Front: {Math.round(centerOfGravity.frontAxleRatio * 100)}%</span>
          <span>Rear: {Math.round(centerOfGravity.rearAxleRatio * 100)}%</span>
        </div>
        <div className="w-full h-1 bg-muted rounded-full mt-3 flex overflow-hidden">
          <div
            className="h-full bg-neutral-400 dark:bg-neutral-500 transition-all"
            style={{ width: `${centerOfGravity.frontAxleRatio * 100}%` }}
          />
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${centerOfGravity.rearAxleRatio * 100}%` }}
          />
        </div>
        <div className="text-[10px] mt-1.5 font-mono text-muted-foreground truncate">
          {isLateralOff ? (
            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 inline" /> Lateral bias: {centerOfGravity.yPercent}%
            </span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 inline" /> Safe Longitudinal & Lateral Balance
            </span>
          )}
        </div>
      </div>

      {/* 4. Pack Status & Solver Speed */}
      <div className="bg-card border border-border p-3.5 sm:p-4 rounded-xl shadow-xs transition-colors">
        <div className="flex items-center justify-between text-muted-foreground text-xs mb-1.5">
          <span className="font-mono tracking-wider uppercase text-[11px]">Dispatch Status</span>
          <Clock className="w-3.5 h-3.5 stroke-[1.8]" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {totalPackedItemsCount}
          </span>
          <span className="text-xs text-muted-foreground">units loaded</span>
          {totalUnplacedItemsCount > 0 && (
            <button
              type="button"
              onClick={() => setUnplacedModalOpen(true)}
              className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/15 hover:bg-red-500/25 px-2 py-0.5 rounded-md border border-red-500/30 transition flex items-center gap-1 cursor-pointer ml-1"
              title="Click to see which item is unplaced, why, and how to fit it"
            >
              <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
              <span>{totalUnplacedItemsCount} unplaced (Click to view)</span>
            </button>
          )}
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-3 font-mono">
          <span>Engine latency:</span>
          <span className="font-semibold text-foreground" suppressHydrationWarning>{calculationTimeMs} ms</span>
        </div>
      </div>
    </div>
  );
};
