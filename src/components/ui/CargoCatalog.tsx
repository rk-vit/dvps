'use client';

import React, { useState } from 'react';
import { usePlannerStore } from '@/lib/store/usePlannerStore';
import { CargoItem, OrientationRestriction } from '@/lib/types/packing';
import {
  Boxes,
  Plus,
  Trash2,
  RefreshCw,
  Layers,
  ShieldAlert,
  ArrowUpDown,
  RotateCw,
} from 'lucide-react';

const COLOR_PALETTE = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#14b8a6', // Teal
];

export const CargoCatalog: React.FC = () => {
  const { items, addItem, updateItem, removeItem, loadSampleData, clearItems } = usePlannerStore();

  const [isAddOpen, setIsAddOpen] = useState(false);

  // New item form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    length: 1500,
    width: 800,
    height: 600,
    weight: 250,
    quantity: 2,
    orientation: 'any' as OrientationRestriction,
    allowStackAbove: true,
    maxWeightOnTopKg: 1000,
    requiredMinSupportPercent: 70,
    color: COLOR_PALETTE[0],
  });

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newItem: CargoItem = {
      id: `item-${Date.now()}`,
      name: formData.name,
      sku: formData.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      length: Number(formData.length) || 1000,
      width: Number(formData.width) || 800,
      height: Number(formData.height) || 600,
      weight: Number(formData.weight) || 100,
      quantity: Number(formData.quantity) || 1,
      orientation: formData.orientation,
      allowStackAbove: formData.allowStackAbove,
      maxWeightOnTopKg: formData.allowStackAbove ? Number(formData.maxWeightOnTopKg) || 1000 : 0,
      requiredMinSupportPercent: Number(formData.requiredMinSupportPercent) || 70,
      color: formData.color,
    };

    addItem(newItem);
    setIsAddOpen(false);
    // Reset form
    setFormData((prev) => ({
      ...prev,
      name: '',
      sku: '',
      color: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)],
    }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg flex flex-col h-full">
      {/* Header & Action Buttons */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Boxes className="w-5 h-5 text-sky-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Cargo Items Catalog ({items.reduce((acc, it) => acc + it.quantity, 0)} units)
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadSampleData()}
            title="Load sample manufacturing batch"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sample Order</span>
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Add Item Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md p-5 rounded-2xl shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <h3 className="font-semibold text-white">Add Manufactured Structure / Cargo</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Item / Structure Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Precast Concrete Beam, Control Cabinet"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">SKU / Code</label>
                  <input
                    type="text"
                    placeholder="e.g. STR-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Length (mm)</label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={formData.length}
                    onChange={(e) => setFormData({ ...formData, length: Number(e.target.value) || 100 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Width (mm)</label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: Number(e.target.value) || 100 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Height (mm)</label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) || 50 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Weight & Orientation */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Unit Weight (kg)</label>
                  <input
                    type="number"
                    min="1"
                    step="10"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Allowed Rotation</label>
                  <select
                    value={formData.orientation}
                    onChange={(e) =>
                      setFormData({ ...formData, orientation: e.target.value as OrientationRestriction })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="any">Any (All 6 3D Rotations)</option>
                    <option value="upright_only">Upright Only (Cannot tip)</option>
                    <option value="flat_only">Flat Only (Largest face down)</option>
                    <option value="lengthwise">Lengthwise (Along truck)</option>
                    <option value="locked">Strict Locked (No rotation)</option>
                  </select>
                </div>
              </div>

              {/* Stacking Rule */}
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowStackAbove}
                    onChange={(e) => setFormData({ ...formData, allowStackAbove: e.target.checked })}
                    className="rounded accent-sky-500 w-4 h-4"
                  />
                  <span className="text-slate-300 font-medium">Allow stacking other items on top</span>
                </label>
                {formData.allowStackAbove ? (
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Max load capacity above:</span>
                    <input
                      type="number"
                      min="100"
                      step="100"
                      value={formData.maxWeightOnTopKg}
                      onChange={(e) =>
                        setFormData({ ...formData, maxWeightOnTopKg: Number(e.target.value) || 0 })
                      }
                      className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-white text-right"
                    />
                    <span className="text-slate-500">kg</span>
                  </div>
                ) : (
                  <span className="text-[11px] text-amber-400 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Fragile / Top Load Prohibited
                  </span>
                )}
              </div>

              {/* Color Swatch Picker */}
              <div>
                <label className="block text-slate-400 mb-1.5">3D Box Color</label>
                <div className="flex items-center gap-2">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setFormData({ ...formData, color: c })}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        formData.color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Items Scrollable Table */}
      <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-2 max-h-[440px]">
        {items.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No items in dispatch batch. Click &quot;Add Item&quot; or &quot;Sample Order&quot; to begin.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800 rounded-xl p-2.5 transition flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-200 truncate">{item.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                    <span>
                      {item.length}×{item.width}×{item.height} mm
                    </span>
                    <span className="text-slate-500">•</span>
                    <span>{item.weight} kg</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Quantity Controls */}
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg px-1 py-0.5">
                  <button
                    onClick={() => {
                      if (item.quantity <= 1) {
                        removeItem(item.id);
                      } else {
                        updateItem(item.id, { quantity: item.quantity - 1 });
                      }
                    }}
                    className="px-1.5 text-slate-400 hover:text-white"
                  >
                    -
                  </button>
                  <span className="font-mono font-semibold px-2 text-sky-400">{item.quantity}</span>
                  <button
                    onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })}
                    className="px-1.5 text-slate-400 hover:text-white"
                  >
                    +
                  </button>
                </div>

                {/* Stacking / Orientation Tags */}
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${
                    item.allowStackAbove
                      ? 'bg-slate-900 text-slate-300 border-slate-700'
                      : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                  }`}
                  title={item.allowStackAbove ? 'Can stack on top' : 'Fragile / No stacking on top'}
                >
                  {item.allowStackAbove ? 'Stackable' : 'Fragile'}
                </span>

                <button
                  onClick={() => removeItem(item.id)}
                  title="Remove item"
                  className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Clear All */}
      {items.length > 0 && (
        <div className="pt-3 mt-2 border-t border-slate-800/80 flex justify-between items-center text-xs text-slate-400">
          <span>{items.length} unique cargo types</span>
          <button
            onClick={() => clearItems()}
            className="text-slate-500 hover:text-rose-400 transition"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};
