'use client';

import React from 'react';
import { usePlannerStore } from '@/lib/store/usePlannerStore';
import { Printer, Download, X, CheckCircle, AlertTriangle, FileText } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col text-slate-100 overflow-hidden print:m-0 print:p-0 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60 print:border-b-2 print:border-black">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400 print:text-black" />
            <div>
              <h2 className="text-base font-bold text-white print:text-black">
                Dispatch Loading Manifest & Sequence Plan
              </h2>
              <p className="text-xs text-slate-400 print:text-gray-600">
                Generated: {new Date(packingResult.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Summary Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 print:border-black print:bg-gray-50">
            <div>
              <div className="text-slate-400 print:text-gray-600">Vehicle / Container:</div>
              <div className="font-semibold text-white print:text-black mt-0.5">
                {selectedVehicle.name}
              </div>
              <div className="text-[11px] font-mono text-slate-400 print:text-gray-500">
                {selectedVehicle.length} × {selectedVehicle.width} × {selectedVehicle.height} mm
              </div>
            </div>

            <div>
              <div className="text-slate-400 print:text-gray-600">Total Cargo Weight:</div>
              <div className="font-semibold text-white print:text-black mt-0.5">
                {packingResult.totalCargoWeightKg.toLocaleString()} kg /{' '}
                {selectedVehicle.maxPayloadKg.toLocaleString()} kg
              </div>
              <div className="text-[11px] font-mono text-emerald-400 print:text-black">
                {packingResult.weightUtilizationPercent}% Payload
              </div>
            </div>

            <div>
              <div className="text-slate-400 print:text-gray-600">Volume Filled:</div>
              <div className="font-semibold text-white print:text-black mt-0.5">
                {packingResult.totalCargoVolumeM3} m³ / {packingResult.vehicleVolumeM3} m³
              </div>
              <div className="text-[11px] font-mono text-sky-400 print:text-black">
                {packingResult.volumeUtilizationPercent}% Space Utilization
              </div>
            </div>

            <div>
              <div className="text-slate-400 print:text-gray-600">Axle Distribution:</div>
              <div className="font-semibold text-white print:text-black mt-0.5">
                Front {Math.round(packingResult.centerOfGravity.frontAxleRatio * 100)}% | Rear{' '}
                {Math.round(packingResult.centerOfGravity.rearAxleRatio * 100)}%
              </div>
              <div className="text-[11px] text-slate-400 print:text-gray-500">
                CoG: ({packingResult.centerOfGravity.x}, {packingResult.centerOfGravity.y},{' '}
                {packingResult.centerOfGravity.z}) mm
              </div>
            </div>
          </div>

          {/* Unplaced Items Alert (if any) */}
          {packingResult.unplacedItems.length > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200">
              <div className="font-semibold flex items-center gap-1.5 text-rose-300">
                <AlertTriangle className="w-4 h-4" />
                <span>Notice: {packingResult.unplacedItems.length} units could not fit in this vehicle</span>
              </div>
              <ul className="mt-2 list-disc list-inside space-y-1 text-[11px]">
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
            <h3 className="font-bold text-sm text-slate-200 print:text-black mb-2">
              Sequential Ground Loading Instructions (Cab $\to$ Tailgate, Floor $\to$ Top)
            </h3>
            <div className="border border-slate-800 print:border-black rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-950/80 print:bg-gray-100 text-[11px] uppercase tracking-wider text-slate-400 print:text-gray-800 border-b border-slate-800 print:border-black">
                  <tr>
                    <th className="p-2.5">Step</th>
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5">SKU</th>
                    <th className="p-2.5">Dimensions (L × W × H)</th>
                    <th className="p-2.5">Placement Coordinates</th>
                    <th className="p-2.5">Weight</th>
                    <th className="p-2.5">Support</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-gray-300">
                  {packingResult.placedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 print:hover:bg-transparent">
                      <td className="p-2.5 font-bold text-sky-400 print:text-black">
                        #{item.stepNumber}
                      </td>
                      <td className="p-2.5 font-medium text-white print:text-black">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block shrink-0 print:border print:border-black"
                            style={{ backgroundColor: item.color }}
                          />
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td className="p-2.5 font-mono text-slate-400 print:text-gray-700">
                        {item.sku || '-'}
                      </td>
                      <td className="p-2.5 font-mono text-slate-300 print:text-black">
                        {item.dimensions.length} × {item.dimensions.width} × {item.dimensions.height} mm
                      </td>
                      <td className="p-2.5 font-mono text-slate-300 print:text-black">
                        X: {item.position.x}mm | Y: {item.position.y}mm | Z: {item.position.z}mm
                      </td>
                      <td className="p-2.5 font-semibold text-slate-200 print:text-black">
                        {item.weight} kg
                      </td>
                      <td className="p-2.5 text-emerald-400 print:text-black font-medium">
                        {item.supportedAreaPercent}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signoff Footer */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-800 print:border-black">
            <div>
              <div className="border-b border-slate-700 print:border-black pb-8" />
              <div className="text-slate-400 print:text-gray-600 mt-1">Forklift / Crane Operator Signature</div>
            </div>
            <div>
              <div className="border-b border-slate-700 print:border-black pb-8" />
              <div className="text-slate-400 print:text-gray-600 mt-1">Dispatch Logistics Supervisor Signoff</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
