'use client';

import React from 'react';
import { usePlannerStore } from '@/lib/store/usePlannerStore';
import {
  AlertTriangle,
  X,
  Truck,
  ArrowRight,
  CheckCircle2,
  Sliders,
  ShieldAlert,
  RotateCw,
  Box,
  Scale,
} from 'lucide-react';

export const UnplacedCargoModal: React.FC = () => {
  const {
    isUnplacedModalOpen,
    setUnplacedModalOpen,
    packingResult,
    items,
    updateItem,
    removeItem,
    vehicles,
    selectedVehicle,
    selectVehicle,
  } = usePlannerStore();

  if (!isUnplacedModalOpen || !packingResult) return null;

  // Calculate unplaced summary per item
  const unplacedDetails = items
    .map((item) => {
      const placedUnits = packingResult.placedItems.filter((p) => p.itemId === item.id);
      const placedCount = placedUnits.length;
      const unplacedCount = Math.max(0, item.quantity - placedCount);
      const unplacedWeightKg = unplacedCount * item.weight;
      const unplacedVolumeM3 = (unplacedCount * (item.length * item.width * item.height)) / 1e9;

      return {
        item,
        placedCount,
        unplacedCount,
        unplacedWeightKg,
        unplacedVolumeM3,
      };
    })
    .filter((entry) => entry.unplacedCount > 0);

  const totalUnplacedUnits = unplacedDetails.reduce((acc, it) => acc + it.unplacedCount, 0);
  const totalUnplacedWeightKg = unplacedDetails.reduce((acc, it) => acc + it.unplacedWeightKg, 0);
  const totalUnplacedVolumeM3 = unplacedDetails.reduce((acc, it) => acc + it.unplacedVolumeM3, 0);

  // Suggest larger vehicles in the fleet
  const largerVehicles = vehicles.filter(
    (v) =>
      v.id !== selectedVehicle.id &&
      (v.length > selectedVehicle.length || v.maxPayloadKg > selectedVehicle.maxPayloadKg)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-card border border-border w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl shadow-2xl text-foreground overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-red-500/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-base flex items-center gap-2">
                <span>Unplaced Cargo Diagnostics</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-600 dark:text-red-400 font-mono font-bold">
                  {totalUnplacedUnits} unit{totalUnplacedUnits > 1 ? 's' : ''} remaining
                </span>
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                {selectedVehicle.name} capacity reached under strict physical & support constraints
              </p>
            </div>
          </div>
          <button
            onClick={() => setUnplacedModalOpen(false)}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-lg border border-border bg-muted/30 font-mono text-[11px]">
            <div>
              <span className="text-muted-foreground block text-[10px]">Unplaced Units</span>
              <span className="text-base font-bold text-red-600 dark:text-red-400">
                {totalUnplacedUnits}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Unplaced Weight</span>
              <span className="text-base font-bold text-foreground">
                {totalUnplacedWeightKg} kg
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Unplaced Volume</span>
              <span className="text-base font-bold text-foreground">
                {totalUnplacedVolumeM3.toFixed(2)} m³
              </span>
            </div>
          </div>

          {/* List of Unplaced Items */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-semibold text-foreground uppercase tracking-wider">
              Items That Could Not Be Loaded:
            </h4>

            {unplacedDetails.map(({ item, placedCount, unplacedCount, unplacedWeightKg }) => {
              const isFragile = !item.allowStackAbove;
              const isUpright = item.orientation === 'upright_only';

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-lg border border-red-500/30 bg-card shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 shadow-xs"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                          <span className="truncate">{item.name}</span>
                          {item.sku && (
                            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.2 rounded border border-border">
                              {item.sku}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-2 mt-0.5">
                          <span>
                            {item.length} × {item.width} × {item.height} mm
                          </span>
                          <span>•</span>
                          <span>{item.weight} kg/unit</span>
                          <span>•</span>
                          <span className="text-red-600 dark:text-red-400 font-semibold">
                            Total Unplaced: {unplacedWeightKg} kg
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono shrink-0">
                      <div className="text-red-600 dark:text-red-400 font-bold text-xs bg-red-500/15 px-2 py-0.5 rounded border border-red-500/30">
                        {unplacedCount} of {item.quantity} UNPLACED
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        ({placedCount} loaded in bed)
                      </div>
                    </div>
                  </div>

                  {/* Physical Reason Diagnostics */}
                  <div className="p-2.5 rounded-md bg-muted/40 border border-border space-y-1.5 font-mono text-[11px]">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-amber-500" />
                      <span>Placement Bottleneck Analysis:</span>
                    </div>
                    <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                      <li>
                        <strong className="text-foreground">Continuous Space: </strong>
                        The remaining open cargo bed area does not fit this item&apos;s footprint (
                        {item.length} × {item.width} mm) under the strict 100% solid base support rule.
                      </li>
                      {isFragile && (
                        <li className="text-amber-600 dark:text-amber-400">
                          <strong className="text-foreground">Fragile (Top Prohibited): </strong>
                          This item cannot bear any weight on top, restricting available placement positions.
                        </li>
                      )}
                      {isUpright && (
                        <li className="text-emerald-600 dark:text-emerald-400">
                          <strong className="text-foreground">Upright Only: </strong>
                          Cannot be rotated on its edge or side; requires full {item.height} mm vertical height.
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Action Resolutions */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-muted-foreground font-mono">
                      Fast Resolution:
                    </span>
                    <div className="flex items-center gap-2">
                      {placedCount > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            updateItem(item.id, { quantity: placedCount });
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Fit {placedCount} Units Only (100% Pack)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            removeItem(item.id);
                          }}
                          className="px-2.5 py-1 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted text-foreground transition"
                        >
                          Remove from this dispatch
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vehicle Upgrade Sizing Solutions */}
          {largerVehicles.length > 0 && (
            <div className="pt-2 border-t border-border space-y-2.5">
              <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
                <Truck className="w-4 h-4 text-accent" />
                <span>Need all units dispatched together? Upgrade Vehicle Sizing:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {largerVehicles.map((vehicle) => (
                  <button
                    key={vehicle.id}
                    onClick={() => {
                      selectVehicle(vehicle.id);
                      setUnplacedModalOpen(false);
                    }}
                    className="p-2.5 rounded-lg border border-border bg-card hover:border-foreground/50 hover:bg-muted/40 transition text-left flex items-center justify-between group shadow-xs cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-foreground text-xs group-hover:text-accent transition">
                        {vehicle.name}
                      </div>
                      <div className="text-[11px] font-mono text-muted-foreground">
                        {(vehicle.length / 1000).toFixed(1)}m L × {(vehicle.width / 1000).toFixed(1)}m W •{' '}
                        {(vehicle.maxPayloadKg / 1000).toFixed(1)}T payload
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/10">
          <div className="text-[11px] font-mono text-muted-foreground">
            Strict 100% solid base support is permanently enforced.
          </div>
          <button
            onClick={() => setUnplacedModalOpen(false)}
            className="px-4 py-1.5 text-xs font-semibold rounded-md bg-foreground text-background hover:opacity-90 transition"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
