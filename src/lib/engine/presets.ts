import { CargoItem, VehicleContainer } from '../types/packing';

export const VEHICLE_PRESETS: VehicleContainer[] = [
  {
    id: 'canter-14ft',
    name: '14ft Canter / Medium Rigid',
    category: 'rigid_truck',
    length: 4200, // 4.2m
    width: 2050,  // 2.05m
    height: 2100, // 2.1m
    maxPayloadKg: 4200, // 4.2 tonnes
    isEnclosed: true,
    doorWidth: 2000,
    doorHeight: 2050,
    wheelbaseMm: 3400,
  },
  {
    id: 'container-20ft',
    name: '20ft Standard Shipping Container',
    category: 'container',
    length: 5898, // ~5.9m
    width: 2352,  // 2.35m
    height: 2393, // 2.39m
    maxPayloadKg: 21700, // 21.7 tonnes
    isEnclosed: true,
    doorWidth: 2340,
    doorHeight: 2280,
  },
  {
    id: 'truck-24ft',
    name: '24ft Heavy Rigid Hauler',
    category: 'rigid_truck',
    length: 7300, // 7.3m
    width: 2400,  // 2.4m
    height: 2450, // 2.45m
    maxPayloadKg: 14000, // 14 tonnes
    isEnclosed: true,
    doorWidth: 2350,
    doorHeight: 2400,
    wheelbaseMm: 5200,
  },
  {
    id: 'container-40ft-hc',
    name: '40ft High Cube Container',
    category: 'container',
    length: 12032, // 12.03m
    width: 2352,   // 2.35m
    height: 2698,  // 2.70m
    maxPayloadKg: 26500, // 26.5 tonnes
    isEnclosed: true,
    doorWidth: 2340,
    doorHeight: 2585,
  },
  {
    id: 'flatbed-40ft',
    name: '40ft Heavy Flatbed Trailer (Open)',
    category: 'flatbed',
    length: 12200, // 12.2m
    width: 2480,   // 2.48m
    height: 2600,  // Max permissible load height clearance
    maxPayloadKg: 28000, // 28 tonnes
    isEnclosed: false,
  },
];

export const SAMPLE_DISPATCH_ITEMS: CargoItem[] = [
  {
    id: 'item-prefab-panel',
    name: 'Modular Prefab Wall Panel',
    sku: 'MFP-W100',
    color: '#3b82f6', // Blue
    length: 2200,
    width: 1000,
    height: 350,
    weight: 280,
    quantity: 4,
    orientation: 'flat_only',
    allowStackAbove: true,
    maxWeightOnTopKg: 1200,
    requiredMinSupportPercent: 100, // 100% Solid support, no mid-air overhang
    destination: 'Sector 4 Site',
  },
  {
    id: 'item-steel-beam',
    name: 'Heavy I-Beam Structural Girder',
    sku: 'STL-G250',
    color: '#ef4444', // Red
    length: 2800,
    width: 450,
    height: 500,
    weight: 520,
    quantity: 3,
    orientation: 'lengthwise',
    allowStackAbove: true,
    maxWeightOnTopKg: 2500,
    requiredMinSupportPercent: 100,
    destination: 'Central Depot',
  },
  {
    id: 'item-control-cabinet',
    name: 'Industrial Control Cabinet (Fragile)',
    sku: 'ELC-CAB8',
    color: '#10b981', // Emerald Green
    length: 1100,
    width: 750,
    height: 1600,
    weight: 210,
    quantity: 2,
    orientation: 'upright_only',
    allowStackAbove: false, // Fragile! Nothing stacked on top
    maxWeightOnTopKg: 0,
    requiredMinSupportPercent: 100,
    destination: 'Substation B',
  },
  {
    id: 'item-precast-block',
    name: 'Precast Foundation Footing',
    sku: 'PCF-F10',
    color: '#f59e0b', // Amber
    length: 1200,
    width: 1100,
    height: 600,
    weight: 850,
    quantity: 2,
    orientation: 'flat_only',
    allowStackAbove: true,
    maxWeightOnTopKg: 3000,
    requiredMinSupportPercent: 100,
    destination: 'Main Yard',
  },
  {
    id: 'item-hvac-unit',
    name: 'Commercial HVAC Air Exchanger',
    sku: 'HVAC-AX3',
    color: '#8b5cf6', // Violet
    length: 1400,
    width: 900,
    height: 1100,
    weight: 340,
    quantity: 2,
    orientation: 'upright_only',
    allowStackAbove: false,
    maxWeightOnTopKg: 0,
    requiredMinSupportPercent: 100, // 100% full support (no dangling overhang)
    destination: 'North Tower',
  },
  {
    id: 'item-strut-box',
    name: 'Boxed Brackets & Anchors Crate',
    sku: 'CRT-ANCH',
    color: '#06b6d4', // Cyan
    length: 900,
    width: 600,
    height: 450,
    weight: 120,
    quantity: 4,
    orientation: 'any',
    allowStackAbove: true,
    maxWeightOnTopKg: 500,
    requiredMinSupportPercent: 100,
    destination: 'General Assembly',
  },
];
