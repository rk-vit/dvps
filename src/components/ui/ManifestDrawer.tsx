'use client';

import React from 'react';
import { usePlannerStore } from '@/lib/store/usePlannerStore';
import { Printer, X, AlertTriangle, FileText } from 'lucide-react';

interface ManifestDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManifestDrawer: React.FC<ManifestDrawerProps> = ({ isOpen, onClose }) => {
  const { packingResult, selectedVehicle } = usePlannerStore();

  if (!isOpen || !packingResult) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-card border border-border w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col text-foreground overflow-hidden print:m-0 print:p-0 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/40 print:border-b-2 print:border-black">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-foreground print:text-black" />
            <div>
              <h2 className="text-sm font-bold tracking-tight text-foreground print:text-black">
                Dispatch Loading Manifest & Sequence Plan
              </h2>
              <p className="text-[11px] font-mono text-muted-foreground print:text-gray-600">
                Generated: {new Date(packingResult.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background font-semibold text-xs transition hover:opacity-90 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Summary Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/30 border border-border print:border-black print:bg-gray-50">
            <div>
              <div className="text-muted-foreground font-mono text-[11px] print:text-gray-600">Vehicle:</div>
              <div className="font-semibold text-foreground print:text-black mt-0.5">
                {selectedVehicle.name}
              </div>
              <div className="text-[11px] font-mono text-muted-foreground print:text-gray-500">
                {selectedVehicle.length} × {selectedVehicle.width} × {selectedVehicle.height} mm
              </div>
            </div>

            <div>
              <div className="text-muted-foreground font-mono text-[11px] print:text-gray-600">Total Weight:</div>
              <div className="font-semibold text-foreground print:text-black mt-0.5">
                {packingResult.totalCargoWeightKg.toLocaleString()} / {selectedVehicle.maxPayloadKg.toLocaleString()} kg
              </div>
              <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 print:text-black">
                {packingResult.weightUtilizationPercent}% Payload
              </div>
            </div>

            <div>
              <div className="text-muted-foreground font-mono text-[11px] print:text-gray-600">Volume Filled:</div>
              <div className="font-semibold text-foreground print:text-black mt-0.5">
                {packingResult.totalCargoVolumeM3} / {packingResult.vehicleVolumeM3} m³
              </div>
              <div className="text-[11px] font-mono text-foreground print:text-black">
                {packingResult.volumeUtilizationPercent}% Space Filled
              </div>
            </div>

            <div>
              <div className="text-muted-foreground font-mono text-[11px] print:text-gray-600">Axle Distribution:</div>
              <div className="font-semibold text-foreground print:text-black mt-0.5">
                Front {Math.round(packingResult.centerOfGravity.frontAxleRatio * 100)}% | Rear{' '}
                {Math.round(packingResult.centerOfGravity.rearAxleRatio * 100)}%
              </div>
              <div className="text-[11px] font-mono text-muted-foreground print:text-gray-500">
                CoG: ({packingResult.centerOfGravity.x}, {packingResult.centerOfGravity.y}, {packingResult.centerOfGravity.z}) mm
              </div>
            </div>
          </div>

          {/* Unplaced Items Alert */}
          {packingResult.unplacedItems.length > 0 && (
            <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Notice: {packingResult.unplacedItems.length} units could not fit in this vehicle</span>
              </div>
              <ul className="mt-2 list-disc list-inside space-y-1 text-[11px] font-mono">
                {packingResult.unplacedItems.map((u, i) => (
                  <li key={i}>
                    {u.item.name} ({u.quantityUnplaced} unit) - {u.details}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Step-by-Step Loading Manifest Table */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider font-mono text-foreground print:text-black mb-2">
              Sequential Ground Loading Instructions (Cab $\to$ Tailgate, Floor $\to$ Top)
            </h3>
            <div className="border border-border print:border-black rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-muted/60 print:bg-gray-100 text-[11px] uppercase tracking-wider text-muted-foreground print:text-gray-800 border-b border-border print:border-black font-mono">
                  <tr>
                    <th className="p-2.5">Step</th>
                    <th className="p-2.5">Structure Description</th>
                    <th className="p-2.5">SKU</th>
                    <th className="p-2.5">Dimensions (L × W × H)</th>
                    <th className="p-2.5">Placement Coordinates</th>
                    <th className="p-2.5">Weight</th>
                    <th className="p-2.5">Support</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border print:divide-gray-300 font-mono text-xs">
                  {packingResult.placedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 print:hover:bg-transparent">
                      <td className="p-2.5 font-bold text-foreground print:text-black">
                        #{item.stepNumber}
                      </td>
                      <td className="p-2.5 font-sans font-medium text-foreground print:text-black">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full inline-block shrink-0 print:border print:border-black"
                            style={{ backgroundColor: item.color }}
                          />
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td className="p-2.5 text-muted-foreground print:text-gray-700">
                        {item.sku || '-'}
                      </td>
                      <td className="p-2.5 text-foreground print:text-black">
                        {item.dimensions.length} × {item.dimensions.width} × {item.dimensions.height} mm
                      </td>
                      <td className="p-2.5 text-muted-foreground print:text-black">
                        X:{item.position.x} Y:{item.position.y} Z:{item.position.z}
                      </td>
                      <td className="p-2.5 font-semibold text-foreground print:text-black">
                        {item.weight} kg
                      </td>
                      <td className="p-2.5 text-emerald-600 dark:text-emerald-400 print:text-black font-medium">
                        {item.supportedAreaPercent}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signoff Footer */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-border print:border-black">
            <div>
              <div className="border-b border-border print:border-black pb-8" />
              <div className="text-muted-foreground print:text-gray-600 mt-1 font-mono text-[11px]">
                Forklift / Crane Operator Signature
              </div>
            </div>
            <div>
              <div className="border-b border-border print:border-black pb-8" />
              <div className="text-muted-foreground print:text-gray-600 mt-1 font-mono text-[11px]">
                Dispatch Logistics Supervisor Signoff
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
