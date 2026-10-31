import { create } from 'zustand';
import { CargoItem, PackingResult, PlacedItem, VehicleContainer } from '../types/packing';
import { VEHICLE_PRESETS, SAMPLE_DISPATCH_ITEMS } from '../engine/presets';
import { solve3DPacking } from '../engine/solver';

export type CameraPreset = 'isometric' | 'top' | 'side' | 'rear';

export interface UserProfile {
  name: string;
  email: string;
  role: 'Dispatch Operations Lead' | 'Warehouse Floor Loader';
  facility: string;
}

export interface DispatchPlan {
  id: string;
  name: string;
  code: string;
  vehicleId: string;
  items: CargoItem[];
  createdAt: string;
  updatedAt: string;
  status: 'Ready for Dispatch' | 'Draft Planning' | 'Completed';
  destination: string;
  notes?: string;
}

export const INITIAL_PLANS: DispatchPlan[] = [
  {
    id: 'plan-101',
    name: 'Sector 4 Prefab & Foundation Dispatch',
    code: 'PLN-8421',
    vehicleId: 'container-20ft',
    items: [...SAMPLE_DISPATCH_ITEMS],
    createdAt: '2026-10-28T09:30:00Z',
    updatedAt: '2026-10-30T14:15:00Z',
    status: 'Ready for Dispatch',
    destination: 'Sector 4 Heavy Industrial Site',
    notes: 'Approved for loading. Foundation footings on floor bed.',
  },
  {
    id: 'plan-102',
    name: 'Structural Steel Girders & Hardware Pack',
    code: 'PLN-8422',
    vehicleId: 'truck-24ft',
    items: [
      SAMPLE_DISPATCH_ITEMS[1], // Heavy I-Beams (3 units)
      SAMPLE_DISPATCH_ITEMS[4], // Commercial HVAC (2 units)
      SAMPLE_DISPATCH_ITEMS[5], // Boxed Brackets (4 units)
    ],
    createdAt: '2026-10-29T11:00:00Z',
    updatedAt: '2026-10-31T08:20:00Z',
    status: 'Ready for Dispatch',
    destination: 'Central Rail Yard Depot',
    notes: 'Heavy axle distribution verified under 14T payload.',
  },
  {
    id: 'plan-103',
    name: 'Commercial HVAC & Control Units Rapid Express',
    code: 'PLN-8423',
    vehicleId: 'canter-14ft',
    items: [
      SAMPLE_DISPATCH_ITEMS[2], // Industrial Control Cabinet (1 unit)
      SAMPLE_DISPATCH_ITEMS[4], // Commercial HVAC (1 unit)
      SAMPLE_DISPATCH_ITEMS[5], // Boxed Brackets (2 units)
    ],
    createdAt: '2026-10-30T16:45:00Z',
    updatedAt: '2026-10-31T10:00:00Z',
    status: 'Draft Planning',
    destination: 'Substation B Expansion Site',
    notes: 'Draft stage. Requires final bay clearance sign-off.',
  },
];

interface PlannerState {
  // Auth State
  currentUser: UserProfile | null;
  login: (user: UserProfile) => void;
  logout: () => void;

  // Dispatch Plans Management
  plans: DispatchPlan[];
  activePlanId: string | null;
  activePlan: DispatchPlan | null;
  createPlan: (newPlan: { name: string; vehicleId: string; destination?: string }) => DispatchPlan;
  loadPlan: (planId: string) => void;
  updatePlan: (id: string, updates: Partial<DispatchPlan>) => void;
  deletePlan: (id: string) => void;
  duplicatePlan: (id: string) => void;

  // Vehicle State
  vehicles: VehicleContainer[];
  selectedVehicleId: string;
  selectedVehicle: VehicleContainer;
  customVehicle: VehicleContainer;

  // Cargo Catalog State (Default: empty for new plans)
  items: CargoItem[];

  // 3D Optimization Results
  packingResult: PackingResult | null;
  isCalculating: boolean;

  // Interactive 3D & Playback State
  activeStep: number;
  isPlaying: boolean;
  playbackSpeed: number;
  cameraView: CameraPreset;
  selectedPlacedItemId: string | null;
  hoveredItemId: string | null;

  // Visual Filters
  cutawayHeightPercent: number;
  showCoGIndicator: boolean;
  showContainerWalls: boolean;
  showDimensionsOnHover: boolean;

  // Diagnostics & Modals
  isUnplacedModalOpen: boolean;
  setUnplacedModalOpen: (open: boolean) => void;

  // Actions
  selectVehicle: (vehicleId: string) => void;
  updateCustomVehicle: (updates: Partial<VehicleContainer>) => void;
  addItem: (item: CargoItem) => void;
  updateItem: (id: string, updates: Partial<CargoItem>) => void;
  removeItem: (id: string) => void;
  setItems: (items: CargoItem[]) => void;
  loadSampleData: () => void;
  clearItems: () => void;

  // Solver
  runPackingOptimization: () => void;

  // Simulation Controls
  setActiveStep: (step: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setCameraView: (view: CameraPreset) => void;
  setSelectedPlacedItemId: (id: string | null) => void;
  setHoveredItemId: (id: string | null) => void;
  setCutawayHeightPercent: (percent: number) => void;
  toggleCoGIndicator: () => void;
  toggleContainerWalls: () => void;
  toggleDimensionsOnHover: () => void;
}

const DEFAULT_CUSTOM_VEHICLE: VehicleContainer = {
  id: 'custom-vehicle',
  name: 'Custom Dimensional Truck',
  category: 'custom',
  length: 6500, // 6.5m
  width: 2400, // 2.4m
  height: 2400, // 2.4m
  maxPayloadKg: 10000,
  isEnclosed: true,
};

export const usePlannerStore = create<PlannerState>((set, get) => {
  const initialVehicle = VEHICLE_PRESETS[1]; // Default to 20ft Container
  // Default items are EMPTY for new clean planning sessions
  const initialItems: CargoItem[] = [];
  const initialResult = solve3DPacking(initialVehicle, initialItems);

  // Check stored auth on initial setup
  let storedUser: UserProfile | null = null;
  if (typeof window !== 'undefined') {
    try {
      const item = localStorage.getItem('axion_auth_user');
      if (item) {
        const parsed = JSON.parse(item);
        if (parsed?.email === 'testuser@axion.com') {
          storedUser = parsed;
        }
      }
    } catch {
      // ignore
    }
  }

  return {
    currentUser: storedUser,
    login: (user: UserProfile) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('axion_auth_user', JSON.stringify(user));
      }
      set({ currentUser: user });
    },
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('axion_auth_user');
      }
      set({ currentUser: null, activePlanId: null, activePlan: null });
    },

    // Plans Management
    plans: INITIAL_PLANS,
    activePlanId: null,
    activePlan: null,

    createPlan: (newPlanData) => {
      const targetVehicle =
        get().vehicles.find((v) => v.id === newPlanData.vehicleId) || get().vehicles[1];
      const newPlan: DispatchPlan = {
        id: `plan-${Date.now()}`,
        name: newPlanData.name,
        code: `PLN-${Math.floor(8000 + Math.random() * 1999)}`,
        vehicleId: newPlanData.vehicleId,
        items: [], // empty by default
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'Draft Planning',
        destination: newPlanData.destination || 'Primary Logistics Depot',
      };

      const updatedPlans = [newPlan, ...get().plans];
      const newResult = solve3DPacking(targetVehicle, []);

      set({
        plans: updatedPlans,
        activePlanId: newPlan.id,
        activePlan: newPlan,
        selectedVehicleId: targetVehicle.id,
        selectedVehicle: targetVehicle,
        items: [],
        packingResult: newResult,
        activeStep: 0,
      });

      return newPlan;
    },

    loadPlan: (planId: string) => {
      const plan = get().plans.find((p) => p.id === planId);
      if (!plan) return;

      const vehicle = get().vehicles.find((v) => v.id === plan.vehicleId) || get().vehicles[1];
      const planItems = [...plan.items];
      const newResult = solve3DPacking(vehicle, planItems);

      set({
        activePlanId: plan.id,
        activePlan: plan,
        selectedVehicleId: vehicle.id,
        selectedVehicle: vehicle,
        items: planItems,
        packingResult: newResult,
        activeStep: newResult.placedItems.length,
        isPlaying: false,
        selectedPlacedItemId: null,
      });
    },

    updatePlan: (id: string, updates: Partial<DispatchPlan>) => {
      const updatedPlans = get().plans.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      );
      const active = get().activePlanId === id ? updatedPlans.find((p) => p.id === id) || null : get().activePlan;
      set({ plans: updatedPlans, activePlan: active });
    },

    deletePlan: (id: string) => {
      const updatedPlans = get().plans.filter((p) => p.id !== id);
      set({
        plans: updatedPlans,
        activePlanId: get().activePlanId === id ? null : get().activePlanId,
        activePlan: get().activePlanId === id ? null : get().activePlan,
      });
    },

    duplicatePlan: (id: string) => {
      const original = get().plans.find((p) => p.id === id);
      if (!original) return;

      const cloned: DispatchPlan = {
        ...original,
        id: `plan-${Date.now()}`,
        name: `${original.name} (Copy)`,
        code: `PLN-${Math.floor(8000 + Math.random() * 1999)}`,
        items: [...original.items],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'Draft Planning',
      };

      set({ plans: [cloned, ...get().plans] });
    },

    // Vehicle State
    vehicles: VEHICLE_PRESETS,
    selectedVehicleId: initialVehicle.id,
    selectedVehicle: initialVehicle,
    customVehicle: DEFAULT_CUSTOM_VEHICLE,

    // Cargo Catalog State (starts empty)
    items: initialItems,

    packingResult: initialResult,
    isCalculating: false,
    activeStep: 0,
    isPlaying: false,
    playbackSpeed: 700,
    cameraView: 'isometric',
    selectedPlacedItemId: null,
    hoveredItemId: null,
    cutawayHeightPercent: 100,
    showCoGIndicator: true,
    showContainerWalls: true,
    showDimensionsOnHover: true,
    isUnplacedModalOpen: false,
    setUnplacedModalOpen: (open: boolean) => set({ isUnplacedModalOpen: open }),

    selectVehicle: (vehicleId: string) => {
      const { vehicles, customVehicle, items, activePlanId, plans } = get();
      let target: VehicleContainer;
      if (vehicleId === 'custom-vehicle') {
        target = customVehicle;
      } else {
        target = vehicles.find((v) => v.id === vehicleId) || vehicles[0];
      }

      const newResult = solve3DPacking(target, items);

      // Also persist vehicle change to active plan if open
      let updatedPlans = plans;
      let updatedActivePlan = get().activePlan;
      if (activePlanId) {
        updatedPlans = plans.map((p) =>
          p.id === activePlanId ? { ...p, vehicleId, updatedAt: new Date().toISOString() } : p
        );
        updatedActivePlan = updatedPlans.find((p) => p.id === activePlanId) || null;
      }

      set({
        selectedVehicleId: vehicleId,
        selectedVehicle: target,
        packingResult: newResult,
        activeStep: newResult.placedItems.length,
        isPlaying: false,
        selectedPlacedItemId: null,
        plans: updatedPlans,
        activePlan: updatedActivePlan,
      });
    },

    updateCustomVehicle: (updates: Partial<VehicleContainer>) => {
      const updatedCustom = { ...get().customVehicle, ...updates };
      const isCustomActive = get().selectedVehicleId === 'custom-vehicle';
      const activeVehicle = isCustomActive ? updatedCustom : get().selectedVehicle;
      const newResult = solve3DPacking(activeVehicle, get().items);

      set({
        customVehicle: updatedCustom,
        selectedVehicle: activeVehicle,
        packingResult: newResult,
        activeStep: newResult.placedItems.length,
      });
    },

    addItem: (newItem: CargoItem) => {
      const updatedItems = [newItem, ...get().items];
      const newResult = solve3DPacking(get().selectedVehicle, updatedItems);
      const activePlanId = get().activePlanId;

      let updatedPlans = get().plans;
      let updatedActive = get().activePlan;
      if (activePlanId) {
        updatedPlans = updatedPlans.map((p) =>
          p.id === activePlanId ? { ...p, items: updatedItems, updatedAt: new Date().toISOString() } : p
        );
        updatedActive = updatedPlans.find((p) => p.id === activePlanId) || null;
      }

      set({
        items: updatedItems,
        packingResult: newResult,
        activeStep: newResult.placedItems.length,
        plans: updatedPlans,
        activePlan: updatedActive,
      });
    },

    updateItem: (id: string, updates: Partial<CargoItem>) => {
      const updatedItems = get().items.map((it) => (it.id === id ? { ...it, ...updates } : it));
      const newResult = solve3DPacking(get().selectedVehicle, updatedItems);
      const activePlanId = get().activePlanId;

      let updatedPlans = get().plans;
      let updatedActive = get().activePlan;
      if (activePlanId) {
        updatedPlans = updatedPlans.map((p) =>
          p.id === activePlanId ? { ...p, items: updatedItems, updatedAt: new Date().toISOString() } : p
        );
        updatedActive = updatedPlans.find((p) => p.id === activePlanId) || null;
      }

      set({
        items: updatedItems,
        packingResult: newResult,
        activeStep: newResult.placedItems.length,
        plans: updatedPlans,
        activePlan: updatedActive,
      });
    },

    removeItem: (id: string) => {
      const updatedItems = get().items.filter((it) => it.id !== id);
      const newResult = solve3DPacking(get().selectedVehicle, updatedItems);
      const activePlanId = get().activePlanId;

      let updatedPlans = get().plans;
      let updatedActive = get().activePlan;
      if (activePlanId) {
        updatedPlans = updatedPlans.map((p) =>
          p.id === activePlanId ? { ...p, items: updatedItems, updatedAt: new Date().toISOString() } : p
        );
        updatedActive = updatedPlans.find((p) => p.id === activePlanId) || null;
      }

      set({
        items: updatedItems,
        packingResult: newResult,
        activeStep: newResult.placedItems.length,
        plans: updatedPlans,
        activePlan: updatedActive,
      });
    },

    setItems: (newItems: CargoItem[]) => {
      const newResult = solve3DPacking(get().selectedVehicle, newItems);
      set({
        items: newItems,
        packingResult: newResult,
        activeStep: newResult.placedItems.length,
      });
    },

    loadSampleData: () => {
      const sample = [...SAMPLE_DISPATCH_ITEMS];
      const newResult = solve3DPacking(get().selectedVehicle, sample);
      const activePlanId = get().activePlanId;

      let updatedPlans = get().plans;
      let updatedActive = get().activePlan;
      if (activePlanId) {
        updatedPlans = updatedPlans.map((p) =>
          p.id === activePlanId ? { ...p, items: sample, updatedAt: new Date().toISOString() } : p
        );
        updatedActive = updatedPlans.find((p) => p.id === activePlanId) || null;
      }

      set({
        items: sample,
        packingResult: newResult,
        activeStep: newResult.placedItems.length,
        plans: updatedPlans,
        activePlan: updatedActive,
      });
    },

    clearItems: () => {
      const newResult = solve3DPacking(get().selectedVehicle, []);
      const activePlanId = get().activePlanId;

      let updatedPlans = get().plans;
      let updatedActive = get().activePlan;
      if (activePlanId) {
        updatedPlans = updatedPlans.map((p) =>
          p.id === activePlanId ? { ...p, items: [], updatedAt: new Date().toISOString() } : p
        );
        updatedActive = updatedPlans.find((p) => p.id === activePlanId) || null;
      }

      set({
        items: [],
        packingResult: newResult,
        activeStep: 0,
        selectedPlacedItemId: null,
        plans: updatedPlans,
        activePlan: updatedActive,
      });
    },

    runPackingOptimization: () => {
      set({ isCalculating: true });
      setTimeout(() => {
        const { selectedVehicle, items } = get();
        const result = solve3DPacking(selectedVehicle, items);
        set({
          packingResult: result,
          activeStep: result.placedItems.length,
          isCalculating: false,
        });
      }, 50);
    },

    setActiveStep: (step: number) => set({ activeStep: step }),
    setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),
    setPlaybackSpeed: (speed: number) => set({ playbackSpeed: speed }),
    setCameraView: (view: CameraPreset) => set({ cameraView: view }),
    setSelectedPlacedItemId: (id: string | null) => set({ selectedPlacedItemId: id }),
    setHoveredItemId: (id: string | null) => set({ hoveredItemId: id }),
    setCutawayHeightPercent: (percent: number) => set({ cutawayHeightPercent: percent }),
    toggleCoGIndicator: () => set((state) => ({ showCoGIndicator: !state.showCoGIndicator })),
    toggleContainerWalls: () => set((state) => ({ showContainerWalls: !state.showContainerWalls })),
    toggleDimensionsOnHover: () =>
      set((state) => ({ showDimensionsOnHover: !state.showDimensionsOnHover })),
  };
});
