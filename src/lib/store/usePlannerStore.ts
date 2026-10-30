import { create } from 'zustand';
import { CargoItem, PackingResult, PlacedItem, VehicleContainer } from '../types/packing';
import { VEHICLE_PRESETS, SAMPLE_DISPATCH_ITEMS } from '../engine/presets';
import { solve3DPacking } from '../engine/solver';

export type CameraPreset = 'isometric' | 'top' | 'side' | 'rear';

interface PlannerState {
  // Vehicle State
  vehicles: VehicleContainer[];
  selectedVehicleId: string;
  selectedVehicle: VehicleContainer;
  customVehicle: VehicleContainer;

  // Cargo Catalog State
  items: CargoItem[];

  // 3D Optimization Results
  packingResult: PackingResult | null;
  isCalculating: boolean;

  // Interactive 3D & Playback State
  activeStep: number; // 0 = empty bed, max = all items loaded
  isPlaying: boolean;
  playbackSpeed: number; // in milliseconds per step (e.g. 800ms)
  cameraView: CameraPreset;
  selectedPlacedItemId: string | null;
  
  // Visual Filters
  cutawayHeightPercent: number; // 100% = show all, 50% = hide top half
  showCoGIndicator: boolean;
  showContainerWalls: boolean;
  showDimensionsOnHover: boolean;

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
  width: 2400,  // 2.4m
  height: 2400, // 2.4m
  maxPayloadKg: 10000,
  isEnclosed: true,
};

export const usePlannerStore = create<PlannerState>((set, get) => {
  const initialVehicle = VEHICLE_PRESETS[1]; // Default to 20ft Container
  const initialItems = [...SAMPLE_DISPATCH_ITEMS];
  const initialResult = solve3DPacking(initialVehicle, initialItems);

  return {
    vehicles: VEHICLE_PRESETS,
    selectedVehicleId: initialVehicle.id,
    selectedVehicle: initialVehicle,
    customVehicle: DEFAULT_CUSTOM_VEHICLE,
    items: initialItems,
    packingResult: initialResult,
    isCalculating: false,
    activeStep: initialResult.placedItems.length,
    isPlaying: false,
    playbackSpeed: 700,
    cameraView: 'isometric',
    selectedPlacedItemId: null,
    cutawayHeightPercent: 100,
    showCoGIndicator: true,
    showContainerWalls: true,
    showDimensionsOnHover: true,

    selectVehicle: (vehicleId: string) => {
      const { vehicles, customVehicle, items } = get();
      let target: VehicleContainer;
      if (vehicleId === 'custom-vehicle') {
        target = customVehicle;
      } else {
        target = vehicles.find((v) => v.id === vehicleId) || vehicles[0];
      }

      const newResult = solve3DPacking(target, items);
      set({
        selectedVehicleId: vehicleId,
        selectedVehicle: target,
        packingResult: newResult,
        activeStep: newResult.placedItems.length,
        isPlaying: false,
        selectedPlacedItemId: null,
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
      set({
        items: updatedItems,
        packingResult: newResult,
        activeStep: newResult.placedItems.length,
      });
    },

    updateItem: (id: string, updates: Partial<CargoItem>) => {
      const updatedItems = get().items.map((it) => (it.id === id ? { ...it, ...updates } : it));
      const newResult = solve3DPacking(get().selectedVehicle, updatedItems);
      set({
        items: updatedItems,
        packingResult: newResult,
        activeStep: newResult.placedItems.length,
      });
    },

    removeItem: (id: string) => {
      const updatedItems = get().items.filter((it) => it.id !== id);
      const newResult = solve3DPacking(get().selectedVehicle, updatedItems);
      set({
        items: updatedItems,
        packingResult: newResult,
        activeStep: newResult.placedItems.length,
        selectedPlacedItemId: null,
      });
    },

    setItems: (newItems: CargoItem[]) => {
      const newResult = solve3DPacking(get().selectedVehicle, newItems);
      set({
        items: newItems,
        packingResult: newResult,
        activeStep: newResult.placedItems.length,
        selectedPlacedItemId: null,
      });
    },

    loadSampleData: () => {
      const newResult = solve3DPacking(get().selectedVehicle, SAMPLE_DISPATCH_ITEMS);
      set({
        items: [...SAMPLE_DISPATCH_ITEMS],
        packingResult: newResult,
        activeStep: newResult.placedItems.length,
        selectedPlacedItemId: null,
      });
    },

    clearItems: () => {
      set({
        items: [],
        packingResult: solve3DPacking(get().selectedVehicle, []),
        activeStep: 0,
        selectedPlacedItemId: null,
      });
    },

    runPackingOptimization: () => {
      set({ isCalculating: true });
      // Execute solver
      setTimeout(() => {
        const { selectedVehicle, items } = get();
        const result = solve3DPacking(selectedVehicle, items);
        set({
          packingResult: result,
          activeStep: result.placedItems.length,
          isCalculating: false,
        });
      }, 30);
    },

    setActiveStep: (step: number) => {
      const max = get().packingResult?.placedItems.length || 0;
      set({ activeStep: Math.max(0, Math.min(step, max)) });
    },

    setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),
    setPlaybackSpeed: (speed: number) => set({ playbackSpeed: speed }),
    setCameraView: (view: CameraPreset) => set({ cameraView: view }),
    setSelectedPlacedItemId: (id: string | null) => set({ selectedPlacedItemId: id }),
    setCutawayHeightPercent: (pct: number) => set({ cutawayHeightPercent: pct }),
    toggleCoGIndicator: () => set((state) => ({ showCoGIndicator: !state.showCoGIndicator })),
    toggleContainerWalls: () => set((state) => ({ showContainerWalls: !state.showContainerWalls })),
    toggleDimensionsOnHover: () => set((state) => ({ showDimensionsOnHover: !state.showDimensionsOnHover })),
  };
});
