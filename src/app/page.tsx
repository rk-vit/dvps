'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlannerStore, DispatchPlan } from '@/lib/store/usePlannerStore';
import { useAuthGuard } from '@/lib/auth/useAuthGuard';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import {
  Plus,
  Search,
  Filter,
  Truck,
  Box,
  Weight,
  Calendar,
  MapPin,
  ArrowRight,
  Copy,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  LogOut,
  User,
  RotateCw,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export default function PlansDashboardPage() {
  const router = useRouter();
  const { isAuthorized } = useAuthGuard();

  const {
    plans,
    createPlan,
    loadPlan,
    deletePlan,
    duplicatePlan,
    vehicles,
    currentUser,
    logout,
  } = usePlannerStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'draft'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Plan Form State
  const [newPlanForm, setNewPlanForm] = useState({
    name: '',
    vehicleId: 'container-20ft',
    destination: 'Sector 4 Heavy Industrial Site',
  });

  const handleOpenCreateModal = () => {
    setNewPlanForm({
      name: `Dispatch Plan #${plans.length + 101}`,
      vehicleId: 'container-20ft',
      destination: 'Plant #4 Staging Bay',
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanForm.name) return;

    const created = createPlan({
      name: newPlanForm.name,
      vehicleId: newPlanForm.vehicleId,
      destination: newPlanForm.destination,
    });

    setIsCreateModalOpen(false);
    // Navigate straight to 3D workbench with empty batch ready for loading
    router.push(`/planner?planId=${created.id}`);
  };

  const handleOpenPlan = (planId: string) => {
    loadPlan(planId);
    router.push(`/planner?planId=${planId}`);
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-mono text-xs">
        <div className="flex items-center gap-2">
          <RotateCw className="w-4 h-4 animate-spin text-accent" />
          <span>Validating Axion Operator Session...</span>
        </div>
      </div>
    );
  }

  // Filter plans
  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.destination.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'ready') return plan.status === 'Ready for Dispatch';
    if (statusFilter === 'draft') return plan.status === 'Draft Planning';
    return true;
  });

  // Calculate high-level metrics
  const totalPlansCount = plans.length;
  const readyPlansCount = plans.filter((p) => p.status === 'Ready for Dispatch').length;
  const draftPlansCount = plans.filter((p) => p.status === 'Draft Planning').length;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      {/* 1. Global Navigation Bar */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-2.5">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm tracking-widest uppercase font-bold text-foreground">
                DVPS
              </span>
              <span className="text-muted-foreground text-xs font-mono">•</span>
              <span className="text-xs font-semibold text-muted-foreground font-mono">
                DISPATCH VEHICLE PLANNING SYSTEM
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground border border-border">
                v1.0 CLP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <div className="h-4 w-px bg-border mx-0.5 hidden sm:block" />

            {currentUser && (
              <div className="flex items-center gap-2 pl-1">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-semibold text-foreground leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    {currentUser.role}
                  </div>
                </div>

                <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center text-foreground font-mono text-xs font-semibold">
                  <User className="w-3.5 h-3.5" />
                </div>

                <button
                  onClick={() => {
                    logout();
                    router.push('/login');
                  }}
                  title="Sign out of dispatch terminal"
                  className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-muted transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Dashboard Content */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* Header Title & Create Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Dispatch Vehicle Plans
            </h1>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              Previous container loading plans, vehicle allocations, and 3D dispatch sequences
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background font-semibold text-xs hover:opacity-90 transition shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Plan</span>
          </button>
        </div>

        {/* High-Level Overview Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-card border border-border p-4 rounded-xl shadow-xs transition-colors">
            <div className="flex items-center justify-between text-muted-foreground text-xs mb-1.5">
              <span className="font-mono tracking-wider uppercase text-[11px]">Total Plans</span>
              <FileSpreadsheet className="w-3.5 h-3.5 stroke-[1.8]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
                {totalPlansCount}
              </span>
              <span className="text-xs text-muted-foreground font-mono">plans configured</span>
            </div>
            <div className="text-[11px] text-muted-foreground font-mono mt-2 flex items-center gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{readyPlansCount} ready</span>
              <span>•</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">{draftPlansCount} in draft</span>
            </div>
          </div>

          <div className="bg-card border border-border p-4 rounded-xl shadow-xs transition-colors">
            <div className="flex items-center justify-between text-muted-foreground text-xs mb-1.5">
              <span className="font-mono tracking-wider uppercase text-[11px]">Transport Fleet</span>
              <Truck className="w-3.5 h-3.5 stroke-[1.8]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
                {vehicles.length}
              </span>
              <span className="text-xs text-muted-foreground font-mono">vehicle classes</span>
            </div>
            <div className="text-[11px] text-muted-foreground font-mono mt-2 truncate">
              14ft Canter, 20ft Container, 24ft Hauler, 40ft HC
            </div>
          </div>

          <div className="bg-card border border-border p-4 rounded-xl shadow-xs transition-colors">
            <div className="flex items-center justify-between text-muted-foreground text-xs mb-1.5">
              <span className="font-mono tracking-wider uppercase text-[11px]">Base Support Mandate</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 stroke-[1.8]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
                100%
              </span>
              <span className="text-xs text-muted-foreground font-mono">solid floor contact</span>
            </div>
            <div className="text-[11px] text-muted-foreground font-mono mt-2">
              Zero mid-air overhang • 4-corner validation
            </div>
          </div>

          <div className="bg-card border border-border p-4 rounded-xl shadow-xs transition-colors">
            <div className="flex items-center justify-between text-muted-foreground text-xs mb-1.5">
              <span className="font-mono tracking-wider uppercase text-[11px]">CLP Solver Engine</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 stroke-[1.8]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
                &lt; 10 ms
              </span>
              <span className="text-xs text-muted-foreground font-mono">execution speed</span>
            </div>
            <div className="text-[11px] text-muted-foreground font-mono mt-2">
              Extreme Points multi-criteria optimization
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search plans by title, PLN code, or destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent transition shadow-xs"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-lg border border-border text-xs font-mono">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md transition ${
                statusFilter === 'all'
                  ? 'bg-foreground text-background font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Plans ({plans.length})
            </button>
            <button
              onClick={() => setStatusFilter('ready')}
              className={`px-3 py-1 rounded-md transition ${
                statusFilter === 'ready'
                  ? 'bg-foreground text-background font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Ready for Dispatch ({readyPlansCount})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1 rounded-md transition ${
                statusFilter === 'draft'
                  ? 'bg-foreground text-background font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Drafts ({draftPlansCount})
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlans.length === 0 ? (
            <div className="col-span-full py-16 text-center border border-dashed border-border rounded-xl bg-card">
              <FileSpreadsheet className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <div className="font-semibold text-sm text-foreground">No plans match your query</div>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                Try adjusting your search terms or create a new dispatch plan.
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="mt-4 px-3 py-1.5 rounded-lg bg-foreground text-background font-semibold text-xs hover:opacity-90 transition"
              >
                + Create New Plan
              </button>
            </div>
          ) : (
            filteredPlans.map((plan) => {
              const vehicle = vehicles.find((v) => v.id === plan.vehicleId) || vehicles[1];
              const totalUnits = plan.items.reduce((acc, it) => acc + it.quantity, 0);
              const totalWeight = plan.items.reduce((acc, it) => acc + it.weight * it.quantity, 0);
              const isReady = plan.status === 'Ready for Dispatch';

              return (
                <div
                  key={plan.id}
                  className="bg-card border border-border hover:border-foreground/40 rounded-xl p-5 shadow-xs transition-all flex flex-col justify-between group space-y-4"
                >
                  {/* Top: Code & Status */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                        {plan.code}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${
                          isReady
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {plan.status}
                      </span>
                    </div>

                    <h3
                      onClick={() => handleOpenPlan(plan.id)}
                      className="text-base font-bold text-foreground group-hover:text-accent transition cursor-pointer truncate"
                      title={plan.name}
                    >
                      {plan.name}
                    </h3>

                    {/* Destination & Meta */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{plan.destination}</span>
                    </div>
                  </div>

                  {/* Middle: Vehicle & Cargo Summary */}
                  <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-2 text-xs font-mono">
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <Truck className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{vehicle.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                      <div>
                        <span>Cargo Units: </span>
                        <span className="font-bold text-foreground">
                          {totalUnits > 0 ? `${totalUnits} units` : '0 (Empty Draft)'}
                        </span>
                      </div>
                      <div>
                        <span>Est. Weight: </span>
                        <span className="font-bold text-foreground">
                          {totalWeight > 0 ? `${(totalWeight / 1000).toFixed(1)} T` : '0 T'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => duplicatePlan(plan.id)}
                        title="Duplicate plan"
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deletePlan(plan.id)}
                        title="Delete plan"
                        className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-muted transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleOpenPlan(plan.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background font-semibold text-xs hover:opacity-90 transition shadow-xs cursor-pointer"
                    >
                      <span>Open 3D Workbench</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Create New Plan Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border border-border w-full max-w-md p-5 rounded-xl shadow-2xl text-foreground">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
              <div>
                <h3 className="font-semibold text-sm">Create New Dispatch Plan</h3>
                <p className="text-[11px] text-muted-foreground font-mono">
                  Starts with an empty cargo list ready for loading
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-muted-foreground text-[11px] mb-1 font-mono">
                  Plan Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heavy Prefab Beam Staging — Bay 2"
                  value={newPlanForm.name}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, name: e.target.value })}
                  className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition"
                />
              </div>

              <div>
                <label className="block text-muted-foreground text-[11px] mb-1 font-mono">
                  Assigned Transport Vehicle *
                </label>
                <select
                  value={newPlanForm.vehicleId}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, vehicleId: e.target.value })}
                  className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-foreground transition"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({(v.length / 1000).toFixed(1)}m × {(v.width / 1000).toFixed(1)}m × {(v.height / 1000).toFixed(1)}m)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground text-[11px] mb-1 font-mono">
                  Delivery Destination / Depot
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sector 4 Industrial Plant"
                  value={newPlanForm.destination}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, destination: e.target.value })}
                  className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 rounded-md border border-border bg-card hover:bg-muted text-foreground transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-foreground text-background font-semibold hover:opacity-90 transition cursor-pointer"
                >
                  Create Plan & Open Workbench
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
