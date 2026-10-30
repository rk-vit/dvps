import { CargoItem, CenterOfGravity, Placement3D, PlacedItem, VehicleContainer } from '../types/packing';
import { RotatedDimension } from './orientations';
import { calculate2DOverlapArea } from './geometry';

const EPSILON = 0.5; // Tolerance for contact surface checks

export interface SupportValidationResult {
  isValid: boolean;
  supportedAreaPercent: number;
  underlyingItems: PlacedItem[];
  reason?: string;
}

/**
 * Validates whether candidate box bottom has solid, non-cantilever physical support.
 * 
 * Rules for industrial dispatch:
 * 1. If placed on the vehicle floor (z = 0), it is 100% supported.
 * 2. If placed on top of other items (z > 0):
 *    - Must have sufficient contact surface (defaults to 100% full base support for machinery/structures).
 *    - Zero/Strict Cantilever: Top item must NOT extend past the outer edges of the underlying support
 *      in a way that leaves corners or side edges dangling in thin air.
 */
export function validateGravityAndSupport(
  pos: Placement3D,
  dim: RotatedDimension,
  item: CargoItem,
  placedItems: PlacedItem[]
): SupportValidationResult {
  // If placed on the floor of the vehicle, it has 100% ground support
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

  // Candidate footprint boundaries
  const candX1 = pos.x;
  const candX2 = pos.x + dim.length;
  const candY1 = pos.y;
  const candY2 = pos.y + dim.width;

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
  // Default to 100% full support for industrial manufacturing structures
  const minRequired = item.requiredMinSupportPercent !== undefined ? item.requiredMinSupportPercent : 100;

  // 1. Minimum support area threshold check
  if (supportedPercent < minRequired - 0.5) {
    return {
      isValid: false,
      supportedAreaPercent: Math.round(supportedPercent),
      underlyingItems,
      reason: `Insufficient base support: ${Math.round(supportedPercent)}% (required: ${minRequired}%)`,
    };
  }

  // 2. Cantilever / Overhang Check:
  // For rigid heavy cargo (> 50kg), do not allow edges to cantilever into thin air unless fully supported.
  // We verify that the candidate does not hang over empty space beyond all underlying supports.
  if (minRequired >= 95 && supportedPercent < 99.5) {
    return {
      isValid: false,
      supportedAreaPercent: Math.round(supportedPercent),
      underlyingItems,
      reason: `Cantilever overhang prohibited: item edges extend beyond underlying support`,
    };
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
