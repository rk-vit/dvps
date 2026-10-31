import { CargoItem, CenterOfGravity, Placement3D, PlacedItem, VehicleContainer } from '../types/packing';
import { RotatedDimension } from './orientations';
import { calculate2DOverlapArea } from './geometry';

const EPSILON = 0.5; // Tolerance for contact surface checks (0.5mm)

export interface SupportValidationResult {
  isValid: boolean;
  supportedAreaPercent: number;
  underlyingItems: PlacedItem[];
  reason?: string;
}

/**
 * Checks if a specific 2D point (x, y) at elevation z is supported by any underlying item top surface
 */
function isPointSupported(
  px: number,
  py: number,
  z: number,
  underlyingItems: PlacedItem[]
): boolean {
  for (const u of underlyingItems) {
    const ux1 = u.position.x - EPSILON;
    const ux2 = u.position.x + u.dimensions.length + EPSILON;
    const uy1 = u.position.y - EPSILON;
    const uy2 = u.position.y + u.dimensions.width + EPSILON;

    if (px >= ux1 && px <= ux2 && py >= uy1 && py <= uy2) {
      return true;
    }
  }
  return false;
}

/**
 * Validates whether candidate box bottom has solid, non-cantilever physical support.
 * 
 * Rules for industrial dispatch (Client Mandate: Strictly 100% support for elevated items):
 * 1. If placed on the vehicle floor (z = 0), it is 100% supported by the vehicle bed.
 * 2. If placed on top of other items (z > 0):
 *    - 100% Base Area must be covered by the top surfaces of flush underlying items.
 *    - All 4 corners of the candidate base must be supported (zero cantilever/dangling edges).
 *    - If an optional lower support % is configured (e.g. for flexible sacks), it respects that threshold.
 */
export function validateGravityAndSupport(
  pos: Placement3D,
  dim: RotatedDimension,
  item: CargoItem,
  placedItems: PlacedItem[]
): SupportValidationResult {
  // 1. Floor Placement: 100% ground support on vehicle bed
  if (pos.z <= EPSILON) {
    return {
      isValid: true,
      supportedAreaPercent: 100,
      underlyingItems: [],
    };
  }

  const baseArea = dim.length * dim.width;
  if (baseArea <= 0) {
    return { isValid: false, supportedAreaPercent: 0, underlyingItems: [], reason: 'Invalid base area' };
  }

  let totalSupportedArea = 0;
  const underlyingItems: PlacedItem[] = [];

  // Find all items whose top surface is flush with the bottom of this candidate box
  for (const placed of placedItems) {
    const topOfPlaced = placed.position.z + placed.dimensions.height;

    // Check if the top surface touches the bottom of the candidate (within tolerance)
    if (Math.abs(topOfPlaced - pos.z) <= EPSILON) {
      const overlap = calculate2DOverlapArea(
        pos.x,
        pos.y,
        dim.length,
        dim.width,
        placed.position.x,
        placed.position.y,
        placed.dimensions.length,
        placed.dimensions.width
      );

      if (overlap > 0) {
        totalSupportedArea += overlap;
        underlyingItems.push(placed);
      }
    }
  }

  const supportedPercent = Math.min(100, (totalSupportedArea / baseArea) * 100);
  
  // Client requirement: defaults strictly to 100% full base support
  const minRequired = item.requiredMinSupportPercent !== undefined ? item.requiredMinSupportPercent : 100;

  // Area threshold check (with floating point tolerance 0.1%)
  if (supportedPercent < minRequired - 0.1) {
    return {
      isValid: false,
      supportedAreaPercent: Math.round(supportedPercent),
      underlyingItems,
      reason: `Insufficient base support: ${Math.round(supportedPercent)}% (required: ${minRequired}%)`,
    };
  }

  // Strict 100% Rule: 4-Corner Non-Cantilever Validation
  // If 100% (or >= 98%) support is required, all 4 corners of the bottom face MUST sit on underlying surface(s)
  if (minRequired >= 98) {
    const corners = [
      { x: pos.x, y: pos.y, name: 'Front-Left' },
      { x: pos.x + dim.length, y: pos.y, name: 'Front-Right' },
      { x: pos.x, y: pos.y + dim.width, name: 'Rear-Left' },
      { x: pos.x + dim.length, y: pos.y + dim.width, name: 'Rear-Right' },
    ];

    for (const c of corners) {
      if (!isPointSupported(c.x, c.y, pos.z, underlyingItems)) {
        return {
          isValid: false,
          supportedAreaPercent: Math.round(supportedPercent),
          underlyingItems,
          reason: `Corner ${c.name} hangs in mid-air (Strict 100% support required)`,
        };
      }
    }
  }

  return {
    isValid: true,
    supportedAreaPercent: Math.round(supportedPercent),
    underlyingItems,
  };
}

/**
 * Validates that placing this item does not violate the stackability or maximum weight-bearing
 * limits of items underneath it.
 */
export function validateStackLoadCapacity(
  itemToPlace: CargoItem,
  underlyingItems: PlacedItem[],
  itemCatalogMap: Map<string, CargoItem>
): { isValid: boolean; reason?: string } {
  for (const underlying of underlyingItems) {
    const catalogItem = itemCatalogMap.get(underlying.itemId);
    
    // Check if underlying item forbids any stacking on top
    if (catalogItem && !catalogItem.allowStackAbove) {
      return {
        isValid: false,
        reason: `Cannot stack on top of '${underlying.name}' (fragile / non-stackable)`,
      };
    }

    // Check if total weight resting on underlying item exceeds its bearing capacity
    const currentWeightOnTop = underlying.stackWeightAboveKg || 0;
    const maxAllowedWeight = catalogItem?.maxWeightOnTopKg ?? 100000;

    if (currentWeightOnTop + itemToPlace.weight > maxAllowedWeight) {
      return {
        isValid: false,
        reason: `Weight on top of '${underlying.name}' would exceed limit (${Math.round(currentWeightOnTop + itemToPlace.weight)}kg > ${maxAllowedWeight}kg)`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Computes the 3D Center of Gravity (CoG) and axle load distribution of the vehicle.
 */
export function calculateCenterOfGravity(
  vehicle: VehicleContainer,
  placedItems: PlacedItem[]
): CenterOfGravity {
  if (placedItems.length === 0) {
    return {
      x: vehicle.length / 2,
      y: vehicle.width / 2,
      z: 0,
      xPercent: 50,
      yPercent: 50,
      zPercent: 0,
      frontAxleWeightKg: 0,
      rearAxleWeightKg: 0,
      frontAxleRatio: 0.5,
      rearAxleRatio: 0.5,
      isLaterallyImbalanced: false,
      isLongitudinallyImbalanced: false,
    };
  }

  let totalWeight = 0;
  let weightedX = 0;
  let weightedY = 0;
  let weightedZ = 0;

  for (const item of placedItems) {
    const w = item.weight;
    totalWeight += w;

    // Centroid of the individual placed item
    const cx = item.position.x + item.dimensions.length / 2;
    const cy = item.position.y + item.dimensions.width / 2;
    const cz = item.position.z + item.dimensions.height / 2;

    weightedX += cx * w;
    weightedY += cy * w;
    weightedZ += cz * w;
  }

  const cogX = weightedX / totalWeight;
  const cogY = weightedY / totalWeight;
  const cogZ = weightedZ / totalWeight;

  const xPercent = (cogX / vehicle.length) * 100;
  const yPercent = (cogY / vehicle.width) * 100;
  const zPercent = (cogZ / vehicle.height) * 100;

  // Axle distribution calculation:
  const rearAxleRatio = Math.max(0, Math.min(1, cogX / vehicle.length));
  const frontAxleRatio = 1 - rearAxleRatio;

  const frontAxleWeightKg = Math.round(totalWeight * frontAxleRatio);
  const rearAxleWeightKg = Math.round(totalWeight * rearAxleRatio);

  const isLaterallyImbalanced = Math.abs(yPercent - 50) > 12;
  const isLongitudinallyImbalanced = frontAxleRatio > 0.75 || rearAxleRatio > 0.85;

  return {
    x: Math.round(cogX),
    y: Math.round(cogY),
    z: Math.round(cogZ),
    xPercent: Math.round(xPercent * 10) / 10,
    yPercent: Math.round(yPercent * 10) / 10,
    zPercent: Math.round(zPercent * 10) / 10,
    frontAxleWeightKg,
    rearAxleWeightKg,
    frontAxleRatio: Math.round(frontAxleRatio * 100) / 100,
    rearAxleRatio: Math.round(rearAxleRatio * 100) / 100,
    isLaterallyImbalanced,
    isLongitudinallyImbalanced,
  };
}
