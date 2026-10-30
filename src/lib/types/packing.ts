/**
 * Core Type Definitions for Dispatch Vehicle Planning & 3D Packing System
 */

// Orientation options allowed for a manufactured structure
export type OrientationRestriction = 
  | 'any'          // Can be rotated in all 6 orientations
  | 'upright_only' // Must keep height upright (can only rotate horizontally 0° or 90°)
  | 'flat_only'    // Must be placed on its largest surface
  | 'lengthwise'   // Must align along the length of the vehicle (e.g. long structural beams)
  | 'locked';      // Strict single orientation (no rotation allowed)

// Priority tier for loading (e.g. VIP items or specific drop-offs)
export type LoadingPriority = 'normal' | 'first' | 'last';

/**
 * Input structure: a manufactured item to be packed and dispatched
 */
export interface CargoItem {
  id: string;
  name: string;
  sku?: string;
  color: string;
  
  // Dimensions in millimeters (mm)
  length: number; // Dimension X
  width: number;  // Dimension Y
  height: number; // Dimension Z
  
  // Weight in kilograms (kg)
  weight: number;
  
  // Quantity of this item to dispatch
  quantity: number;
  
  // Real-world physical constraints
  orientation: OrientationRestriction;
  allowStackAbove: boolean; // Can other items be placed on top of this?
  maxWeightOnTopKg: number; // Maximum combined weight this item can bear on top
  requiredMinSupportPercent: number; // Minimum base support required (e.g. 70 for 70%)
  
  // Custom metadata (e.g. customer name, work order ID, site)
  destination?: string;
  notes?: string;
}

/**
 * Dimensions and capacities of a transport vehicle or trailer
 */
export interface VehicleContainer {
  id: string;
  name: string;
  category: 'van' | 'rigid_truck' | 'semi_trailer' | 'container' | 'flatbed' | 'custom';
  
  // Internal cargo bed dimensions in millimeters (mm)
  length: number; // Length of bed (front to back)
  width: number;  // Usable width of bed (side to side)
  height: number; // Usable height of bed (floor to ceiling/max clearance)
  
  // Capacities
  maxPayloadKg: number; // Maximum permissible cargo weight
  tareWeightKg?: number; // Empty weight of vehicle
  
  // Physical features
  isEnclosed: boolean;  // True = box truck/container (rear loading only), False = flatbed (top/side load)
  doorWidth?: number;   // In mm
  doorHeight?: number;  // In mm
  
  // Axle configuration for weight distribution
  wheelbaseMm?: number;
  frontAxleLimitKg?: number;
  rearAxleLimitKg?: number;
}

/**
 * 3D Placement Coordinates and orientation
 */
export interface Placement3D {
  x: number; // Distance from front-left-bottom corner along vehicle Length (mm)
  y: number; // Distance along vehicle Width (mm)
  z: number; // Distance along vehicle Height (mm)
}

/**
 * An item placed inside the vehicle at a determined position and orientation
 */
export interface PlacedItem {
  id: string;
  itemId: string;
  name: string;
  sku?: string;
  color: string;
  
  // Original dimensions
  originalDimensions: {
    length: number;
    width: number;
    height: number;
  };
  
  // Placed dimensions after 3D rotation (mm)
  dimensions: {
    length: number; // Placed size along truck X (Length)
    width: number;  // Placed size along truck Y (Width)
    height: number; // Placed size along truck Z (Height)
  };
  
  // Placed coordinate in container (mm)
  position: Placement3D;
  
  // Physical parameters
  weight: number;
  supportedAreaPercent: number; // e.g. 100% on floor, or 85% on underlying cargo
  stackWeightAboveKg: number;   // Weight of all items directly and transitively resting on it
  
  // Loading step sequence (1, 2, 3...)
  stepNumber: number;
  
  // Explanation of placement choice
  placementReason?: string;
}

/**
 * Item that could not fit due to volume, weight, or geometric constraints
 */
export interface UnplacedItem {
  item: CargoItem;
  quantityUnplaced: number;
  reason: 'exceeds_payload_weight' | 'no_fitting_space' | 'orientation_conflict' | 'stacking_violation';
  details: string;
}

/**
 * Center of Gravity and Axle Distribution Metrics
 */
export interface CenterOfGravity {
  // Absolute coordinates inside container (mm)
  x: number;
  y: number;
  z: number;
  
  // Percentage offsets relative to container dimensions
  xPercent: number; // 50% is dead center along length
  yPercent: number; // 50% is dead center along width (lateral balance)
  zPercent: number; // Lower is safer for roll stability
  
  // Axle load estimations
  frontAxleWeightKg: number;
  rearAxleWeightKg: number;
  frontAxleRatio: number; // e.g. 0.45 (45%)
  rearAxleRatio: number;  // e.g. 0.55 (55%)
  
  // Balance warnings
  isLaterallyImbalanced: boolean; // Lateral deviation > 10%
  isLongitudinallyImbalanced: boolean; // Front or rear axle overloaded
}

/**
 * Complete Output Result of the 3D Packing Engine
 */
export interface PackingResult {
  vehicle: VehicleContainer;
  placedItems: PlacedItem[];
  unplacedItems: UnplacedItem[];
  
  // Summary Statistics
  totalPackedItemsCount: number;
  totalUnplacedItemsCount: number;
  
  // Volumetric metrics
  totalCargoVolumeM3: number;
  vehicleVolumeM3: number;
  volumeUtilizationPercent: number;
  
  // Weight metrics
  totalCargoWeightKg: number;
  maxPayloadKg: number;
  weightUtilizationPercent: number;
  
  // Center of Gravity & Safety
  centerOfGravity: CenterOfGravity;
  
  // Execution performance
  calculationTimeMs: number;
  timestamp: string;
}
