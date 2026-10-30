import { Placement3D, PlacedItem, VehicleContainer } from '../types/packing';

export interface BoxDimensions3D {
  length: number; // Size along container X (Length)
  width: number;  // Size along container Y (Width)
  height: number; // Size along container Z (Height)
}

const EPSILON = 0.001; // Tolerance for floating point boundary comparisons

/**
 * Checks if a candidate box placement stays fully inside the vehicle container boundaries
 */
export function isWithinContainer(
  pos: Placement3D,
  dim: BoxDimensions3D,
  vehicle: VehicleContainer
): boolean {
  if (pos.x < 0 || pos.y < 0 || pos.z < 0) return false;
  if (pos.x + dim.length > vehicle.length + EPSILON) return false;
  if (pos.y + dim.width > vehicle.width + EPSILON) return false;
  if (pos.z + dim.height > vehicle.height + EPSILON) return false;
  return true;
}

/**
 * Checks if candidate box A collides with placed box B in 3D space (AABB collision test)
 */
export function checkAABBCollision(
  posA: Placement3D,
  dimA: BoxDimensions3D,
  itemB: PlacedItem
): boolean {
  const posB = itemB.position;
  const dimB = itemB.dimensions;

  // Boxes do NOT collide if they are separated along any axis
  const separatedX = posA.x + dimA.length <= posB.x + EPSILON || posA.x >= posB.x + dimB.length - EPSILON;
  const separatedY = posA.y + dimA.width <= posB.y + EPSILON || posA.y >= posB.y + dimB.width - EPSILON;
  const separatedZ = posA.z + dimA.height <= posB.z + EPSILON || posA.z >= posB.z + dimB.height - EPSILON;

  return !(separatedX || separatedY || separatedZ);
}

/**
 * Checks if candidate box collides with ANY already placed item in the vehicle
 */
export function hasCollisionWithPlacedItems(
  pos: Placement3D,
  dim: BoxDimensions3D,
  placedItems: PlacedItem[]
): boolean {
  for (const placed of placedItems) {
    if (checkAABBCollision(pos, dim, placed)) {
      return true;
    }
  }
  return false;
}

/**
 * Calculates the 2D intersection area (footprint) between candidate bottom face and an underlying top face
 */
export function calculate2DOverlapArea(
  x1: number,
  y1: number,
  l1: number,
  w1: number,
  x2: number,
  y2: number,
  l2: number,
  w2: number
): number {
  const overlapX = Math.max(0, Math.min(x1 + l1, x2 + l2) - Math.max(x1, x2));
  const overlapY = Math.max(0, Math.min(y1 + w1, y2 + w2) - Math.max(y1, y2));
  return overlapX * overlapY;
}
