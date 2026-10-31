'use client';

import React, { useState } from 'react';
import { usePlannerStore } from '@/lib/store/usePlannerStore';
import { CargoItem, OrientationRestriction, PlacedItem } from '@/lib/types/packing';
import {
  Plus,
  Trash2,
  RefreshCw,
  X,
  ShieldAlert,
  HelpCircle,
  Pencil,
  AlertTriangle,
} from 'lucide-react';
import { RotationRulesModal } from './RotationRuleVisualizer';
import { UnplacedCargoModal } from './UnplacedCargoModal';

export type DimensionUnit = 'mm' | 'cm' | 'm' | 'in';

export const UNIT_CONFIG: Record<
  DimensionUnit,
  { label: string; symbol: string; toMmMultiplier: number; decimals: number; step: string; min: string }
> = {
  mm: { label: 'Millimeters', symbol: 'mm', toMmMultiplier: 1, decimals: 0, step: '10', min: '20' },
  cm: { label: 'Centimeters', symbol: 'cm', toMmMultiplier: 10, decimals: 1, step: '1', min: '2' },
  m: { label: 'Meters', symbol: 'm', toMmMultiplier: 1000, decimals: 3, step: '0.05', min: '0.02' },
  in: { label: 'Inches', symbol: 'in', toMmMultiplier: 25.4, decimals: 1, step: '0.5', min: '1' },
};

export function convertDimension(
  value: number,
  fromUnit: DimensionUnit,
  toUnit: DimensionUnit
): number {
  if (fromUnit === toUnit) return value;
  const valInMm = value * UNIT_CONFIG[fromUnit].toMmMultiplier;
  const valInTarget = valInMm / UNIT_CONFIG[toUnit].toMmMultiplier;
  const decimals = UNIT_CONFIG[toUnit].decimals;
  return Number(valInTarget.toFixed(decimals));
}

export function formatDimension(valMm: number, unit: DimensionUnit): string {
  const converted = valMm / UNIT_CONFIG[unit].toMmMultiplier;
  const decimals = UNIT_CONFIG[unit].decimals;
  return Number(converted.toFixed(decimals)).toString();
}

const COLOR_PALETTE = [
  '#0284c7', // Slate Blue
  '#dc2626', // Crimson Red
  '#059669', // Emerald
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#0891b2', // Cyan
  '#db2777', // Rose
  '#475569', // Slate Gray
];

export const CargoCatalog: React.FC = () => {
  const {
    items,
    addItem,
    updateItem,
    removeItem,
    loadSampleData,
    clearItems,
    hoveredItemId,
    setHoveredItemId,
    packingResult,
    setUnplacedModalOpen,
  } = usePlannerStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [modalUnit, setModalUnit] = useState<DimensionUnit>('mm');
  const [catalogDisplayUnit, setCatalogDisplayUnit] = useState<DimensionUnit>('mm');
  const [catalogFilter, setCatalogFilter] = useState<'all' | 'unplaced' | 'placed'>('all');
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [activeModalRule, setActiveModalRule] = useState<OrientationRestriction>('any');

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
    color: COLOR_PALETTE[0],
  });

  const handleOpenAdd = () => {
    setEditingItemId(null);
    setModalUnit('mm');
    setFormData({
      name: '',
      sku: `STR-${Math.floor(100 + Math.random() * 900)}`,
      length: 1500,
      width: 800,
      height: 600,
      weight: 250,
      quantity: 2,
      orientation: 'any',
      allowStackAbove: true,
      maxWeightOnTopKg: 1000,
      color: COLOR_PALETTE[items.length % COLOR_PALETTE.length],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: CargoItem) => {
    setEditingItemId(item.id);
    setModalUnit('mm');
    setFormData({
      name: item.name,
      sku: item.sku || '',
      length: item.length,
      width: item.width,
      height: item.height,
      weight: item.weight,
      quantity: item.quantity,
      orientation: item.orientation,
      allowStackAbove: item.allowStackAbove,
      maxWeightOnTopKg: item.maxWeightOnTopKg,
      color: item.color,
    });
    setIsModalOpen(true);
  };

  const handleModalUnitChange = (newUnit: DimensionUnit) => {
    if (newUnit === modalUnit) return;
    setFormData((prev) => ({
      ...prev,
      length: convertDimension(Number(prev.length) || 0, modalUnit, newUnit),
      width: convertDimension(Number(prev.width) || 0, modalUnit, newUnit),
      height: convertDimension(Number(prev.height) || 0, modalUnit, newUnit),
    }));
    setModalUnit(newUnit);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    // Convert from current modalUnit back to integer millimeters for the packing engine
    const lengthMm = Math.max(10, Math.round(Number(formData.length) * UNIT_CONFIG[modalUnit].toMmMultiplier));
    const widthMm = Math.max(10, Math.round(Number(formData.width) * UNIT_CONFIG[modalUnit].toMmMultiplier));
    const heightMm = Math.max(10, Math.round(Number(formData.height) * UNIT_CONFIG[modalUnit].toMmMultiplier));

    if (editingItemId) {
      updateItem(editingItemId, {
        name: formData.name,
        sku: formData.sku || undefined,
        length: lengthMm,
        width: widthMm,
        height: heightMm,
        weight: Math.max(1, Number(formData.weight) || 1),
        quantity: Math.max(1, Number(formData.quantity) || 1),
        orientation: formData.orientation,
        allowStackAbove: formData.allowStackAbove,
        maxWeightOnTopKg: formData.allowStackAbove ? Number(formData.maxWeightOnTopKg) || 1000 : 0,
        requiredMinSupportPercent: 100, // Client mandate: 100% strict support
        color: formData.color,
      });
    } else {
      const newItem: CargoItem = {
        id: `item-${Date.now()}`,
        name: formData.name,
        sku: formData.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        length: lengthMm,
        width: widthMm,
        height: heightMm,
        weight: Math.max(1, Number(formData.weight) || 100),
        quantity: Math.max(1, Number(formData.quantity) || 1),
        orientation: formData.orientation,
        allowStackAbove: formData.allowStackAbove,
        maxWeightOnTopKg: formData.allowStackAbove ? Number(formData.maxWeightOnTopKg) || 1000 : 0,
        requiredMinSupportPercent: 100, // Client mandate: 100% strict support
        color: formData.color,
      };
      addItem(newItem);
    }

    setIsModalOpen(false);
    setEditingItemId(null);
  };

  const totalUnits = items.reduce((acc, it) => acc + it.quantity, 0);

  // Status mapping for items
  const itemsWithStatus = items.map((item) => {
    const placedList: PlacedItem[] =
      packingResult?.placedItems.filter((p: PlacedItem) => p.itemId === item.id) || [];
    const placedCount = placedList.length;
    const unplacedCount = Math.max(0, item.quantity - placedCount);
    const rotatedCount = placedList.filter(
      (p: PlacedItem) =>
        p.dimensions.length !== item.length ||
        p.dimensions.width !== item.width ||
        p.dimensions.height !== item.height
    ).length;

    return { item, placedList, placedCount, unplacedCount, rotatedCount };
  });

  const unplacedItemsList = itemsWithStatus.filter((it) => it.unplacedCount > 0);
  const totalUnplacedUnits = unplacedItemsList.reduce((acc, it) => acc + it.unplacedCount, 0);

  const displayedItems = itemsWithStatus.filter((it) => {
    if (catalogFilter === 'unplaced') return it.unplacedCount > 0;
    if (catalogFilter === 'placed') return it.unplacedCount === 0;
    return true;
  });

  return (
    <div className="bg-card border border-border p-4 rounded-xl shadow-xs transition-colors flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs tracking-wider uppercase font-semibold text-foreground">
            Cargo Items Catalog
          </span>
          <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {totalUnits} units
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setActiveModalRule('any');
              setIsRulesModalOpen(true);
            }}
            title="View animated visual guide for all 5 3D rotation rules"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition shadow-xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-500" />
            <span className="hidden sm:inline">Rotation Guide</span>
          </button>
          <button
            onClick={() => loadSampleData()}
            title="Load standard manufacturing batch"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition shadow-xs"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Sample Batch</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-foreground text-background hover:opacity-90 transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Structure</span>
          </button>
        </div>
      </div>

      {/* Prominent Unplaced Item Alert Banner */}
      {totalUnplacedUnits > 0 && (
        <div className="mt-2.5 p-2.5 rounded-lg border border-red-500/40 bg-red-500/10 text-xs flex items-center justify-between gap-2 shadow-xs transition-all">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <div className="truncate">
              <span className="font-semibold text-red-600 dark:text-red-400">
                {totalUnplacedUnits} unit{totalUnplacedUnits > 1 ? 's' : ''} unplaced:{' '}
              </span>
              <span className="text-foreground font-medium">
                {unplacedItemsList.map((it) => `${it.item.name} (${it.unplacedCount})`).join(', ')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setCatalogFilter(catalogFilter === 'unplaced' ? 'all' : 'unplaced')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono border transition ${
                catalogFilter === 'unplaced'
                  ? 'bg-red-600 text-white border-red-600 font-bold'
                  : 'bg-card text-foreground border-border hover:bg-muted'
              }`}
            >
              {catalogFilter === 'unplaced' ? 'Show All' : 'Filter Unplaced'}
            </button>
            <button
              type="button"
              onClick={() => setUnplacedModalOpen(true)}
              className="px-2 py-0.5 rounded text-[11px] font-mono bg-foreground text-background font-semibold hover:opacity-90 transition"
            >
              Diagnostics
            </button>
          </div>
        </div>
      )}

      {/* Catalog Filter Tabs & Display Units Selector Bar */}
      <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-2.5 px-0.5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCatalogFilter('all')}
            className={`px-2 py-0.5 rounded text-[11px] transition ${
              catalogFilter === 'all'
                ? 'bg-foreground text-background font-semibold'
                : 'hover:text-foreground text-muted-foreground'
            }`}
          >
            All ({items.length})
          </button>
          {unplacedItemsList.length > 0 && (
            <button
              onClick={() => setCatalogFilter(catalogFilter === 'unplaced' ? 'all' : 'unplaced')}
              className={`px-2 py-0.5 rounded text-[11px] transition flex items-center gap-1 ${
                catalogFilter === 'unplaced'
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-500/25 border border-red-500/30'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-red-500" />
              <span>Unplaced ({unplacedItemsList.length})</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">Dimensions:</span>
          <div className="flex items-center gap-0.5 bg-muted/60 p-0.5 rounded border border-border">
            {(['mm', 'cm', 'm', 'in'] as DimensionUnit[]).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setCatalogDisplayUnit(u)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium transition ${
                  catalogDisplayUnit === u
                    ? 'bg-foreground text-background font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title={`Display catalog dimensions in ${UNIT_CONFIG[u].label}`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add / Edit Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border border-border w-full max-w-lg p-5 rounded-xl shadow-xl text-foreground max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
              <div>
                <h3 className="font-semibold text-sm">
                  {editingItemId ? 'Edit Manufactured Structure' : 'Add Manufactured Structure'}
                </h3>
                <p className="text-[11px] text-muted-foreground font-mono">
                  {editingItemId
                    ? 'Update dimensions, physical constraints, and dispatch rules'
                    : 'Strict 100% solid base support is permanently enforced'}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingItemId(null);
                }}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-muted-foreground text-[11px] mb-1 font-mono">
                  Structure / Part Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Precast Concrete Beam, Industrial Truss"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-muted-foreground text-[11px] mb-1 font-mono">SKU / Code</label>
                  <input
                    type="text"
                    placeholder="e.g. STR-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-foreground transition"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground text-[11px] mb-1 font-mono">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) || 1 })}
                    className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-foreground transition"
                  />
                </div>
              </div>

              {/* Dimensions Input with Unit Switcher (mm, cm, m, in) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-muted-foreground text-[11px] font-mono">
                    Dimensions: Length × Width × Height *
                  </label>
                  <div className="flex items-center gap-0.5 bg-muted/60 p-0.5 rounded border border-border">
                    {(['mm', 'cm', 'm', 'in'] as DimensionUnit[]).map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => handleModalUnitChange(u)}
                        className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded transition ${
                          modalUnit === u
                            ? 'bg-foreground text-background shadow-xs'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        title={`Specify dimensions in ${UNIT_CONFIG[u].label}`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={UNIT_CONFIG[modalUnit].min}
                      step={UNIT_CONFIG[modalUnit].step}
                      placeholder="L"
                      value={formData.length}
                      onChange={(e) => setFormData({ ...formData, length: Number(e.target.value) || 0 })}
                      className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-foreground transition pr-9"
                    />
                    <span className="absolute right-2 top-2 text-[10px] text-muted-foreground font-mono pointer-events-none">
                      L ({modalUnit})
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={UNIT_CONFIG[modalUnit].min}
                      step={UNIT_CONFIG[modalUnit].step}
                      placeholder="W"
                      value={formData.width}
                      onChange={(e) => setFormData({ ...formData, width: Number(e.target.value) || 0 })}
                      className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-foreground transition pr-9"
                    />
                    <span className="absolute right-2 top-2 text-[10px] text-muted-foreground font-mono pointer-events-none">
                      W ({modalUnit})
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={UNIT_CONFIG[modalUnit].min}
                      step={UNIT_CONFIG[modalUnit].step}
                      placeholder="H"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) || 0 })}
                      className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-foreground transition pr-9"
                    />
                    <span className="absolute right-2 top-2 text-[10px] text-muted-foreground font-mono pointer-events-none">
                      H ({modalUnit})
                    </span>
                  </div>
                </div>

                {modalUnit !== 'mm' && (
                  <div className="mt-1 text-[10px] font-mono text-muted-foreground">
                    ≈ {Math.round(formData.length * UNIT_CONFIG[modalUnit].toMmMultiplier)} ×{' '}
                    {Math.round(formData.width * UNIT_CONFIG[modalUnit].toMmMultiplier)} ×{' '}
                    {Math.round(formData.height * UNIT_CONFIG[modalUnit].toMmMultiplier)} mm (engine base)
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-muted-foreground text-[11px] mb-1 font-mono">Unit Weight (kg)</label>
                  <input
                    type="number"
                    min="1"
                    step="10"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) || 1 })}
                    className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-foreground transition"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-muted-foreground text-[11px] font-mono">Rotation Rule</label>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModalRule(formData.orientation);
                        setIsRulesModalOpen(true);
                      }}
                      className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-mono"
                    >
                      <HelpCircle className="w-3 h-3" />
                      Visual Examples
                    </button>
                  </div>
                  <select
                    value={formData.orientation}
                    onChange={(e) =>
                      setFormData({ ...formData, orientation: e.target.value as OrientationRestriction })
                    }
                    className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition font-mono"
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
              <div className="bg-muted/40 p-2.5 rounded-lg border border-border space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowStackAbove}
                    onChange={(e) => setFormData({ ...formData, allowStackAbove: e.target.checked })}
                    className="rounded border-border accent-accent"
                  />
                  <span className="font-medium text-foreground">Allow stacking other items on top</span>
                </label>
                {formData.allowStackAbove ? (
                  <div className="flex items-center justify-between text-muted-foreground font-mono">
                    <span>Max load capacity above:</span>
                    <input
                      type="number"
                      min="100"
                      step="100"
                      value={formData.maxWeightOnTopKg}
                      onChange={(e) =>
                        setFormData({ ...formData, maxWeightOnTopKg: Number(e.target.value) || 0 })
                      }
                      className="w-20 bg-background border border-border rounded px-2 py-0.5 text-foreground text-right"
                    />
                    <span>kg</span>
                  </div>
                ) : (
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Fragile / Top Load Prohibited
                  </span>
                )}
              </div>

              {/* Color Swatch Picker */}
              <div>
                <label className="block text-muted-foreground text-[11px] mb-1 font-mono">Color Marker</label>
                <div className="flex items-center gap-2">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setFormData({ ...formData, color: c })}
                      className={`w-5 h-5 rounded-full transition-transform ${
                        formData.color === c
                          ? 'scale-125 ring-2 ring-foreground ring-offset-2 ring-offset-card'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingItemId(null);
                  }}
                  className="px-3 py-1.5 rounded-md border border-border bg-card hover:bg-muted text-foreground transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-foreground text-background font-semibold hover:opacity-90 transition"
                >
                  {editingItemId ? 'Save Changes' : 'Add Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Items Scrollable List */}
      <div className="flex-1 overflow-y-auto mt-2 pr-1 space-y-2 max-h-[460px]">
        {displayedItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-xs font-mono">
            {catalogFilter === 'unplaced'
              ? 'Great news! All cargo units fit into the selected transport.'
              : 'No items in dispatch batch. Click "Add Structure" or "Sample Batch".'}
          </div>
        ) : (
          displayedItems.map(({ item, placedCount, unplacedCount, rotatedCount }) => {
            const isRowHovered = hoveredItemId === item.id;
            const hasUnplaced = unplacedCount > 0;

            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredItemId(item.id)}
                onMouseLeave={() => setHoveredItemId(null)}
                className={`border rounded-lg p-2.5 transition-all flex items-center justify-between gap-3 text-xs shadow-xs cursor-pointer ${
                  hasUnplaced
                    ? 'border-red-500/60 bg-red-500/5 dark:bg-red-500/10 ring-1 ring-red-500/30'
                    : isRowHovered
                    ? 'border-lime-500 bg-lime-500/15 dark:border-lime-400 dark:bg-lime-400/15 ring-2 ring-lime-400/50 translate-x-1'
                    : 'bg-card hover:bg-muted/40 border-border'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground truncate">{item.name}</span>
                      {item.sku && (
                        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.2 rounded border border-border">
                          {item.sku}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span>
                        {formatDimension(item.length, catalogDisplayUnit)} ×{' '}
                        {formatDimension(item.width, catalogDisplayUnit)} ×{' '}
                        {formatDimension(item.height, catalogDisplayUnit)} {catalogDisplayUnit}
                      </span>
                      <span>•</span>
                      <span>{item.weight} kg</span>

                      {/* Placed Status */}
                      <span>•</span>
                      <span
                        className={
                          hasUnplaced
                            ? 'text-red-600 dark:text-red-400 font-semibold'
                            : 'text-emerald-600 dark:text-emerald-400 font-semibold'
                        }
                      >
                        {placedCount}/{item.quantity} loaded
                      </span>

                      {/* Prominent Unplaced Warning Badge */}
                      {hasUnplaced && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUnplacedModalOpen(true);
                          }}
                          className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-600 dark:text-red-400 font-bold border border-red-500/30 text-[10px] flex items-center gap-1 hover:underline cursor-pointer"
                          title="Click to view why this item could not fit and explore sizing solutions"
                        >
                          <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                          <span>{unplacedCount} UNPLACED</span>
                        </button>
                      )}

                      {/* Rotated Badge */}
                      {rotatedCount > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveModalRule(item.orientation);
                            setIsRulesModalOpen(true);
                          }}
                          className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] hover:underline"
                          title={`${rotatedCount} of ${placedCount} loaded units rotated on side to fit space with 100% solid support. Click for guide.`}
                        >
                          ↻ {rotatedCount} turned on edge
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Quantity Controls */}
                  <div className="flex items-center bg-background border border-border rounded-md px-1 py-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.quantity <= 1) {
                          removeItem(item.id);
                        } else {
                          updateItem(item.id, { quantity: item.quantity - 1 });
                        }
                      }}
                      className="px-1.5 text-muted-foreground hover:text-foreground font-mono"
                    >
                      -
                    </button>
                    <span className="font-mono font-semibold px-2 text-foreground">{item.quantity}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateItem(item.id, { quantity: item.quantity + 1 });
                      }}
                      className="px-1.5 text-muted-foreground hover:text-foreground font-mono"
                    >
                      +
                    </button>
                  </div>

                  {/* 1-Click Fit Placed Button if has unplaced */}
                  {hasUnplaced && placedCount > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateItem(item.id, { quantity: placedCount });
                      }}
                      className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 transition"
                      title={`Reduce requested quantity to ${placedCount} so vehicle is 100% packed`}
                    >
                      Fit {placedCount}
                    </button>
                  )}

                  {/* Rotation Rule Tag - Click to view guide */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModalRule(item.orientation);
                      setIsRulesModalOpen(true);
                    }}
                    className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-muted/60 text-muted-foreground hover:text-foreground hover:border-foreground/30 font-mono transition cursor-pointer"
                    title={`Rotation mode: ${item.orientation}. Click to view animated rules explanation.`}
                  >
                    {item.orientation === 'any'
                      ? '↻ Any 3D'
                      : item.orientation === 'upright_only'
                      ? '↑ Upright'
                      : item.orientation === 'flat_only'
                      ? '▭ Flat'
                      : item.orientation === 'locked'
                      ? '🔒 Locked'
                      : '↔ Lengthwise'}
                  </button>

                  {/* Stacking Tag */}
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded border font-mono ${
                      item.allowStackAbove
                        ? 'bg-muted text-muted-foreground border-border'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {item.allowStackAbove ? 'Stackable' : 'Fragile'}
                  </span>

                  {/* Edit Item Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(item);
                    }}
                    title="Edit structure details, dimensions, and rules"
                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  {/* Remove Item Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item.id);
                    }}
                    title="Remove item"
                    className="p-1 rounded text-muted-foreground hover:text-red-500 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Clear All */}
      {items.length > 0 && (
        <div className="pt-3 mt-2 border-t border-border flex justify-between items-center text-xs text-muted-foreground font-mono text-[11px]">
          <span>{items.length} unique structure types</span>
          <button onClick={() => clearItems()} className="hover:text-red-500 transition">
            Clear All
          </button>
        </div>
      )}

      {/* Full 3D Rotation Rules Modal */}
      <RotationRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        initialRule={activeModalRule}
        onSelectRule={(rule) => {
          setFormData((prev) => ({ ...prev, orientation: rule }));
        }}
      />

      {/* Unplaced Cargo Diagnostics & Sizing Modal */}
      <UnplacedCargoModal />
    </div>
  );
};
