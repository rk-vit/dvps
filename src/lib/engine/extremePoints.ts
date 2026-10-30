import { Placement3D, PlacedItem, VehicleContainer } from '../types/packing';
import { RotatedDimension } from './orientations';

const EPSILON = 0.5;

/**
 * Checks if a point lies strictly inside an already placed box (excluding outer surfaces)
 */
export function isPointInsideBox(point: Placement3D, box: PlacedItem): boolean {
  return (
    point.x > box.position.x - EPSILON &&
    point.x < box.position.x + box.dimensions.length - EPSILON &&
    point.y > box.position.y - EPSILON &&
    point.y < box.position.y + box.dimensions.width - EPSILON &&
    point.z > box.position.z - EPSILON &&
    point.z < box.position.z + box.dimensions.height - EPSILON
  );
}

/**
 * Checks if two points are identical within a small tolerance
 */
export function arePointsEqual(p1: Placement3D, p2: Placement3D): boolean {
  return (
    Math.abs(p1.x - p2.x) < EPSILON &&
    Math.abs(p1.y - p2.y) < EPSILON &&
    Math.abs(p1.z - p2.z) < EPSILON
  );
}

/**
 * Generates and updates candidate 3D Extreme Points after placing a new item.
 */
export function updateExtremePoints(
  currentPoints: Placement3D[],
  newPlacedItem: PlacedItem,
  allPlacedItems: PlacedItem[],
  vehicle: VehicleContainer
): Placement3D[] {
  const { position: p, dimensions: d } = newPlacedItem;

  // 1. Generate the 3 primary extreme points created by the newly placed item
  const newCandidates: Placement3D[] = [
    { x: p.x + d.length, y: p.y, z: p.z }, // Along vehicle length
    { x: p.x, y: p.y + d.width, z: p.z }, // Along vehicle width
    { x: p.x, y: p.y, z: p.z + d.height }, // Atop the item
  ];

  // 2. Generate projection extreme points onto adjacent surfaces to maximize dense packing
  for (const other of allPlacedItems) {
    if (other.id === newPlacedItem.id) continue;

    // Projection along X: from top edge of new item onto adjacent item's top/side
    if (p.x + d.length <= other.position.x && p.y < other.position.y + other.dimensions.width && p.y + d.width > other.position.y) {
      newCandidates.push({ x: other.position.x, y: p.y, z: p.z });
    }

    // Projection along Y: from side of new item onto adjacent item's edge
    if (p.y + d.width <= other.position.y && p.x < other.position.x + other.dimensions.length && p.x + d.length > other.position.x) {
      newCandidates.push({ x: p.x, y: other.position.y, z: p.z });
    }

    // Vertical step projection: item atop another item with differing step height
    if (other.position.z + other.dimensions.height === p.z) {
      newCandidates.push({ x: p.x + d.length, y: p.y, z: other.position.z + other.dimensions.height });
      newCandidates.push({ x: p.x, y: p.y + d.width, z: other.position.z + other.dimensions.height });
    }
  }

  // 3. Combine existing points and new candidates
  const combined = [...currentPoints, ...newCandidates];
  const validPoints: Placement3D[] = [];

  for (const pt of combined) {
    // Boundary check: cannot exceed container
    if (pt.x >= vehicle.length || pt.y >= vehicle.width || pt.z >= vehicle.height) {
      continue;
    }
    if (pt.x < 0 || pt.y < 0 || pt.z < 0) {
      continue;
    }

    // Collision check: point cannot be inside any placed box
    let isInsideAny = false;
    for (const box of allPlacedItems) {
      if (isPointInsideBox(pt, box)) {
        isInsideAny = true;
        break;
      }
    }
    if (isInsideAny) continue;

    // Deduplication check: point must not already be in validPoints
    const alreadyExists = validPoints.some((existing) => arePointsEqual(existing, pt));
    if (!alreadyExists) {
      validPoints.push(pt);
    }
  }

  // 4. Sort points by packing strategy:
  // - Low Z first (gravity / floor-first)
  // - Low X first (pack front of truck / cab towards rear)
  // - Low Y first (pack left-to-right)
  validPoints.sort((a, b) => {
    if (Math.abs(a.z - b.z) > EPSILON) return a.z - b.z;
    if (Math.abs(a.x - b.x) > EPSILON) return a.x - b.x;
    return a.y - b.y;
  });

  return validPoints;
}
