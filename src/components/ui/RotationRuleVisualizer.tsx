'use client';

import React, { useState } from 'react';
import { OrientationRestriction } from '@/lib/types/packing';
import {
  RotateCw,
  ArrowUp,
  Square,
  MoveHorizontal,
  Lock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Sparkles,
  Info,
} from 'lucide-react';

interface RotationRuleVisualizerProps {
  rule: OrientationRestriction;
  compact?: boolean;
}

export const ROTATION_RULES_INFO: Record<
  OrientationRestriction,
  {
    key: OrientationRestriction;
    title: string;
    badge: string;
    shortLabel: string;
    description: string;
    movementSummary: string;
    whyDimensionsChange: string;
    allowedMoves: string[];
    forbiddenMoves: string[];
    realWorldExamples: string[];
    icon: React.ElementType;
    color: string;
  }
> = {
  any: {
    key: 'any',
    title: 'Any (All 6 3D Rotations Allowed)',
    badge: '↻ Any 3D Axis',
    shortLabel: 'Any 3D',
    description:
      'The engine can freely tumble, turn on edge, or lay flat to fit tight spaces and maximize cubic payload volume.',
    movementSummary: 'Full 360° rotation across X, Y, and Z axes (Flat, On-Edge, or Upright).',
    whyDimensionsChange:
      'If Length × Width × Height is 900 × 600 × 450 mm, the engine may place it as 900 × 450 × 600 mm or 450 × 600 × 900 mm to fill gaps.',
    allowedMoves: ['Lay flat (L × W × H)', 'Turn on side/edge (L × H × W)', 'Stand upright (H × W × L)'],
    forbiddenMoves: [],
    realWorldExamples: [
      'Boxed brackets & anchor crates',
      'Symmetrical metal castings & billets',
      'Solid hardware & fastener cartons',
      'Durable raw machined blocks',
    ],
    icon: RotateCw,
    color: '#0284c7',
  },
  upright_only: {
    key: 'upright_only',
    title: 'Upright Only (Vertical Height Locked)',
    badge: '↑ Upright Only',
    shortLabel: 'Upright Only',
    description:
      'Must keep its height pointing vertical (+Z). Cannot be tipped on its side or laid flat. Can only rotate horizontally 0° or 90° (yaw).',
    movementSummary: 'Horizontal 90° turn only (yaw). Tipping, rolling, or edge placement is strictly blocked.',
    whyDimensionsChange:
      'Height (Z) is strictly locked. Length and Width can swap (0° or 90° yaw) to orient along or across the truck bed.',
    allowedMoves: ['Standard upright (L × W × H)', 'Horizontal 90° turn (W × L × H)'],
    forbiddenMoves: ['Tipping on side (H on side)', 'Inverting upside down', 'Rolling on edges'],
    realWorldExamples: [
      'Industrial electrical control cabinets',
      'Commercial HVAC air handlers (internal compressors/oil)',
      'Structural glass A-frame racks',
      'Hydraulic power units with fluid reservoirs',
    ],
    icon: ArrowUp,
    color: '#10b981',
  },
  flat_only: {
    key: 'flat_only',
    title: 'Flat Only (Largest Face Downward)',
    badge: '▭ Flat Surface Only',
    shortLabel: 'Flat Only',
    description:
      'Must rest firmly on its largest surface face. Cannot be stood upright on edge due to structural deflection or tipping danger.',
    movementSummary: 'Largest surface must face truck bed floor. Can rotate 90° horizontally.',
    whyDimensionsChange:
      'The smallest dimension remains Height (Z). Length and Width can orient 0° or 90° to fit bed width.',
    allowedMoves: ['Flat standard (Face L × W)', 'Flat 90° turned (Face W × L)'],
    forbiddenMoves: ['Standing tall on thin edge (causes tipping/cracking)', 'Vertical leaning'],
    realWorldExamples: [
      'Precast concrete foundation footings & slabs',
      'Modular prefab wall panels',
      'Granite & architectural stone slabs',
      'Heavy flat steel plate stacks',
    ],
    icon: Square,
    color: '#f59e0b',
  },
  lengthwise: {
    key: 'lengthwise',
    title: 'Lengthwise (Aligned Along Truck Length)',
    badge: '↔ Lengthwise Only',
    shortLabel: 'Lengthwise',
    description:
      'Longest dimension must point along the truck bed length (front-to-back X axis) to prevent protruding beyond truck width.',
    movementSummary: 'Longest axis locked to truck length (X). Can lay flat or turn on edge.',
    whyDimensionsChange:
      'Longest side is always placed along the vehicle length (X). Width and Height may swap to fit vertical clearance.',
    allowedMoves: ['Lengthwise flat (Longest along X)', 'Lengthwise on-edge (Longest along X)'],
    forbiddenMoves: ['Crosswise placement (blocks width / exceeds 2.4m bed width)'],
    realWorldExamples: [
      'Heavy structural I-beams (3m to 12m)',
      'Prefabricated steel roof trusses',
      'Industrial conduit & rebar bundles',
      'Long structural pipe sections',
    ],
    icon: MoveHorizontal,
    color: '#8b5cf6',
  },
  locked: {
    key: 'locked',
    title: 'Locked (Strict Single Orientation)',
    badge: '🔒 Strict Locked (0°)',
    shortLabel: 'Locked (0°)',
    description:
      'Zero rotation permitted. Must be loaded into the truck exactly as specified by original Length, Width, and Height dimensions.',
    movementSummary: 'Strict single 3D orientation (XYZ exactly as entered).',
    whyDimensionsChange: 'Dimensions NEVER change. The placed box exactly matches catalog Length × Width × Height.',
    allowedMoves: ['Original orientation only (0° roll, pitch, and yaw)'],
    forbiddenMoves: ['Any rotation on any axis'],
    realWorldExamples: [
      'Custom machinery with designated forklift pockets on one side',
      'Asymmetrical components with fragile cantilever arms',
      'Assemblies with top-mounted crane lifting eyes',
      'Directional fragile equipment with fragile sensors',
    ],
    icon: Lock,
    color: '#ef4444',
  },
};

/**
 * Animated CSS 3D Box for each rotation rule
 */
export const RotationBoxPreview: React.FC<{ rule: OrientationRestriction; size?: 'sm' | 'md' | 'lg' }> = ({
  rule,
  size = 'md',
}) => {
  const isSm = size === 'sm';
  const boxHeight = isSm ? 'h-20' : size === 'lg' ? 'h-36' : 'h-28';

  return (
    <div
      className={`${boxHeight} w-full rounded-md bg-muted/40 border border-border flex items-center justify-center relative overflow-hidden`}
    >
      <div className="perspective-box relative flex items-center justify-center w-24 h-24">
        {rule === 'any' && (
          <div className="w-14 h-14 bg-sky-500/80 border-2 border-sky-300 rounded shadow-lg animate-tumble-3d flex items-center justify-center text-white font-mono text-[10px] font-bold">
            3D TUMBLE
          </div>
        )}

        {rule === 'upright_only' && (
          <div className="w-12 h-20 bg-emerald-500/80 border-2 border-emerald-300 rounded shadow-lg animate-spin-3d flex flex-col items-center justify-between py-1 text-white font-mono text-[9px] font-bold">
            <span>↑ TOP</span>
            <span className="text-[11px]">UP</span>
            <span>BASE</span>
          </div>
        )}

        {rule === 'flat_only' && (
          <div className="w-20 h-8 bg-amber-500/80 border-2 border-amber-300 rounded shadow-lg animate-flat-turn-3d flex items-center justify-center text-white font-mono text-[9px] font-bold">
            FLAT SLAB
          </div>
        )}

        {rule === 'lengthwise' && (
          <div className="w-22 h-9 bg-purple-500/80 border-2 border-purple-300 rounded shadow-lg animate-lengthwise-pulse flex items-center justify-between px-1.5 text-white font-mono text-[9px] font-bold">
            <span>◄</span>
            <span>ALONG TRUCK (X)</span>
            <span>►</span>
          </div>
        )}

        {rule === 'locked' && (
          <div className="w-14 h-14 bg-red-500/80 border-2 border-red-300 rounded shadow-lg flex items-center justify-center text-white font-mono text-[10px] font-bold flex-col gap-1">
            <Lock className="w-4 h-4" />
            <span>LOCKED</span>
          </div>
        )}
      </div>

      <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-background/80 border border-border text-foreground backdrop-blur-xs flex items-center gap-1">
        <span>{ROTATION_RULES_INFO[rule]?.badge}</span>
      </div>
    </div>
  );
};

export const RotationRuleVisualizer: React.FC<RotationRuleVisualizerProps> = ({
  rule,
  compact = false,
}) => {
  const info = ROTATION_RULES_INFO[rule] || ROTATION_RULES_INFO.any;
  const Icon = info.icon;

  if (compact) {
    return (
      <div className="p-2.5 rounded-lg border border-border bg-muted/20 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <Icon className="w-3.5 h-3.5" style={{ color: info.color }} />
            <span>{info.title}</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
            {info.movementSummary}
          </span>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-24 shrink-0">
            <RotationBoxPreview rule={rule} size="sm" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-[11px] text-muted-foreground leading-relaxed">{info.description}</p>
            <div className="text-[10px] font-mono text-foreground pt-1">
              <span className="text-muted-foreground">Why dimensions may rotate: </span>
              {info.whyDimensionsChange}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground">
              <span className="font-semibold text-foreground">Examples: </span>
              {info.realWorldExamples.slice(0, 2).join(', ')}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-lg border border-border bg-card space-y-3 text-xs shadow-xs">
      <RotationBoxPreview rule={rule} size="md" />

      <div className="space-y-1">
        <div className="font-semibold text-foreground text-sm flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: info.color }} />
          <span>{info.title}</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{info.description}</p>
      </div>

      <div className="p-2.5 rounded-md bg-muted/40 border border-border space-y-1">
        <div className="font-mono text-[10px] font-semibold text-foreground flex items-center gap-1">
          <Info className="w-3 h-3 text-sky-500" />
          Dimension Behavior in Truck:
        </div>
        <p className="text-[11px] font-mono text-muted-foreground">{info.whyDimensionsChange}</p>
      </div>

      <div className="space-y-1 font-mono text-[11px]">
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{info.movementSummary}</span>
        </div>
        {info.forbiddenMoves.length > 0 && (
          <div className="flex items-center gap-1.5 text-red-500 dark:text-red-400">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Forbidden: {info.forbiddenMoves.join(', ')}</span>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-border space-y-1.5">
        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
          Typical Real-World Manufacturing Parts:
        </span>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-foreground">
          {info.realWorldExamples.map((ex, idx) => (
            <li key={idx} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: info.color }} />
              <span className="truncate">{ex}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export interface RotationRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRule?: OrientationRestriction;
  onSelectRule?: (rule: OrientationRestriction) => void;
}

export const RotationRulesModal: React.FC<RotationRulesModalProps> = ({
  isOpen,
  onClose,
  initialRule = 'any',
  onSelectRule,
}) => {
  const [selectedTab, setSelectedTab] = useState<OrientationRestriction>(initialRule);

  if (!isOpen) return null;

  const rulesList: OrientationRestriction[] = ['any', 'upright_only', 'flat_only', 'lengthwise', 'locked'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-card border border-border w-full max-w-3xl max-h-[90vh] flex flex-col rounded-xl shadow-2xl text-foreground overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-foreground/5 border border-border">
              <RotateCw className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-semibold text-sm sm:text-base">3D Cargo Rotation Rules & Placement Guide</h2>
              <p className="text-xs text-muted-foreground font-mono">
                Physical constraints, space optimization, and why placed dimensions may turn on edge
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Explanation Callout for User's Question */}
          <div className="p-3.5 rounded-lg border border-sky-500/30 bg-sky-500/10 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-sky-600 dark:text-sky-400">
              <Sparkles className="w-4 h-4" />
              <span>Why do identical catalog items sometimes have different dimensions in the 3D bed?</span>
            </div>
            <p className="text-foreground/90 leading-relaxed">
              When an item is configured with <strong>&quot;Any 3D Rotation&quot;</strong>, the 3D container packing algorithm
              is permitted to turn that unit on its edge or side (e.g. from flat 900 × 600 × 450 mm to edge 900 × 450 × 600 mm)
              to fill narrow remaining gaps on the truck floor while maintaining strict 100% solid base support.
            </p>
            <p className="text-muted-foreground text-[11px]">
              If a structure cannot be placed on its side (e.g., electrical cabinets, fluid tanks, or fragile top faces),
              simply configure its rotation rule to <strong>&quot;Upright Only&quot;</strong>, <strong>&quot;Flat Only&quot;</strong>, or <strong>&quot;Strict Locked&quot;</strong>.
            </p>
          </div>

          {/* Rule Selector Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-lg border border-border overflow-x-auto">
            {rulesList.map((r) => {
              const info = ROTATION_RULES_INFO[r];
              const Icon = info.icon;
              const isActive = selectedTab === r;
              return (
                <button
                  key={r}
                  onClick={() => setSelectedTab(r)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition shrink-0 ${
                    isActive
                      ? 'bg-card text-foreground shadow-xs border border-border'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: info.color }} />
                  <span>{info.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Active Rule Detailed Card */}
          <div className="transition-all">
            <RotationRuleVisualizer rule={selectedTab} compact={false} />
          </div>

          {/* Side-by-Side Comparison Matrix */}
          <div className="pt-2">
            <h4 className="font-mono text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              All 5 Rotation Constraints At A Glance:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
              {rulesList.map((r) => {
                const info = ROTATION_RULES_INFO[r];
                const Icon = info.icon;
                const isCurrent = selectedTab === r;
                return (
                  <div
                    key={r}
                    onClick={() => setSelectedTab(r)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
                      isCurrent
                        ? 'border-foreground bg-muted/60 ring-1 ring-foreground/20'
                        : 'border-border bg-card hover:bg-muted/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1 font-semibold text-[11px] mb-1">
                        <Icon className="w-3 h-3 shrink-0" style={{ color: info.color }} />
                        <span className="truncate">{info.shortLabel}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight">
                        {info.movementSummary}
                      </p>
                    </div>
                    <div className="mt-2 pt-1 border-t border-border/50 text-[9px] font-mono text-muted-foreground">
                      {info.realWorldExamples[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/10">
          <div className="text-[11px] font-mono text-muted-foreground">
            Strict 100% solid base support is permanently enforced across all rules.
          </div>
          <div className="flex items-center gap-2">
            {onSelectRule && (
              <button
                onClick={() => {
                  onSelectRule(selectedTab);
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-md bg-foreground text-background hover:opacity-90 transition"
              >
                Apply &quot;{ROTATION_RULES_INFO[selectedTab].shortLabel}&quot;
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card text-foreground hover:bg-muted transition"
            >
              Close Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
