import {
  CargoItem,
  PackingResult,
  PlacedItem,
  Placement3D,
  UnplacedItem,
  VehicleContainer,
} from '../types/packing';
import { getPermissibleOrientations, RotatedDimension } from './orientations';
import { isWithinContainer, hasCollisionWithPlacedItems } from './geometry';
import {
  calculateCenterOfGravity,
  validateGravityAndSupport,
  validateStackLoadCapacity,
} from './physics';
import { updateExtremePoints } from './extremePoints';

interface CandidateEvaluation {
  point: Placement3D;
  dimension: RotatedDimension;
  score: number;
  supportedAreaPercent: number;
  underlyingItems: PlacedItem[];
}

/**
 * Evaluates candidate points and finds the best placement according to compactness,
 * low center-of-gravity, and front-to-back sequence.
 */
function evaluateCandidates(
  item: CargoItem,
  candidatePoints: Placement3D[],
  placedItems: PlacedItem[],
  vehicle: VehicleContainer,
  itemCatalogMap: Map<string, CargoItem>
): CandidateEvaluation | null {
  const allowedOrientations = getPermissibleOrientations(item);
  let bestCandidate: CandidateEvaluation | null = null;
  let minScore = Infinity;

  for (const point of candidatePoints) {
    for (const dim of allowedOrientations) {
      // 1. Boundary check: must fit inside vehicle bed
      if (!isWithinContainer(point, dim, vehicle)) {
        continue;
      }

      // 2. Collision check: must not intersect existing placed items
      if (hasCollisionWithPlacedItems(point, dim, placedItems)) {
        continue;
      }

      // 3. Gravity and structural support check
      const support = validateGravityAndSupport(point, dim, item, placedItems);
      if (!support.isValid) {
        continue;
      }

      // 4. Stacking load check on underlying items
      const stackCheck = validateStackLoadCapacity(item, support.underlyingItems, itemCatalogMap);
      if (!stackCheck.isValid) {
        continue;
      }

      // 5. Multi-criteria Scoring Function:
      // Lower score is better:
      // - Prioritize lower Z heavily (gravity stability, fill floor first)
      // - Prioritize lower X (pack front cab first, moving towards rear doors)
      // - Prioritize lower Y (snug against left wall)
      const zPenalty = point.z * 1000;
      const xPenalty = point.x * 10;
      const yPenalty = point.y * 1;

      // Surface contact bonus: reward placements that touch container walls or existing items
      let contactScore = 0;
      if (point.x === 0) contactScore -= 50; // Against front wall
      if (point.y === 0) contactScore -= 50; // Against left wall
      if (point.y + dim.width >= vehicle.width - 1) contactScore -= 30; // Against right wall

      const score = zPenalty + xPenalty + yPenalty + contactScore;

      if (score < minScore) {
        minScore = score;
        bestCandidate = {
          point,
          dimension: dim,
          score,
          supportedAreaPercent: support.supportedAreaPercent,
          underlyingItems: support.underlyingItems,
        };
      }
    }
  }

  return bestCandidate;
}

/**
 * Recursively updates the transitive stacked weight on top of all underlying items
 */
function addWeightToStackHierarchy(
  underlyingItems: PlacedItem[],
  weightToAdd: number,
  placedMap: Map<string, PlacedItem>
) {
  for (const under of underlyingItems) {
    under.stackWeightAboveKg = (under.stackWeightAboveKg || 0) + weightToAdd;
  }
}

/**
 * Master 3D Packing Optimization Solver
 */
export function solve3DPacking(
  vehicle: VehicleContainer,
  items: CargoItem[]
): PackingResult {
  const startTime = performance.now();

  // Create a lookup map for items
  const itemCatalogMap = new Map<string, CargoItem>();
  for (const item of items) {
    itemCatalogMap.set(item.id, item);
  }

  // 1. Expand items by quantity into individual units
  const unitsToPack: { item: CargoItem; unitIndex: number }[] = [];
  for (const item of items) {
    for (let q = 0; q < item.quantity; q++) {
      unitsToPack.push({ item, unitIndex: q + 1 });
    }
  }

  // 2. Multi-Criteria Best-Fit Decreasing Sorting:
  // Non-fragile, heavy, large footprint items form the base foundation and are loaded first.
  unitsToPack.sort((a, b) => {
    const itemA = a.item;
    const itemB = b.item;

    // Items that can bear weight should be placed before items that cannot
    if (itemA.allowStackAbove !== itemB.allowStackAbove) {
      return itemA.allowStackAbove ? -1 : 1;
    }

    const volA = itemA.length * itemA.width * itemA.height;
    const volB = itemB.length * itemB.width * itemB.height;

    const baseAreaA = itemA.length * itemA.width;
    const baseAreaB = itemB.length * itemB.width;

    // Composite structural score
    const scoreA = itemA.weight * 0.4 + baseAreaA * 0.35 + volA * 0.25;
    const scoreB = itemB.weight * 0.4 + baseAreaB * 0.35 + volB * 0.25;

    return scoreB - scoreA;
  });

  const placedItems: PlacedItem[] = [];
  const unplacedItems: UnplacedItem[] = [];
  const placedMap = new Map<string, PlacedItem>();

  // Initialize Extreme Points with the origin corner of the truck bed
  let extremePoints: Placement3D[] = [{ x: 0, y: 0, z: 0 }];

  let currentTotalWeightKg = 0;
  let currentTotalCargoVolumeMm3 = 0;

  // 3. Process each unit through the packing solver
  for (const unit of unitsToPack) {
    const { item, unitIndex } = unit;

    // Payload weight capacity check
    if (currentTotalWeightKg + item.weight > vehicle.maxPayloadKg) {
      unplacedItems.push({
        item,
        quantityUnplaced: 1,
        reason: 'exceeds_payload_weight',
        details: `Vehicle max payload reached (${currentTotalWeightKg}kg / ${vehicle.maxPayloadKg}kg). Item weight: ${item.weight}kg.`,
      });
      continue;
    }

    // Find best candidate point and orientation
    const bestPlacement = evaluateCandidates(
      item,
      extremePoints,
      placedItems,
      vehicle,
      itemCatalogMap
    );

    if (bestPlacement) {
      const placedId = `${item.id}-${unitIndex}-${Date.now()}`;
      const newPlaced: PlacedItem = {
        id: placedId,
        itemId: item.id,
        name: item.name,
        sku: item.sku,
        color: item.color,
        originalDimensions: {
          length: item.length,
          width: item.width,
          height: item.height,
        },
        dimensions: {
          length: bestPlacement.dimension.length,
          width: bestPlacement.dimension.width,
          height: bestPlacement.dimension.height,
        },
        position: { ...bestPlacement.point },
        weight: item.weight,
        supportedAreaPercent: bestPlacement.supportedAreaPercent,
        stackWeightAboveKg: 0,
        stepNumber: placedItems.length + 1,
        placementReason: `Placed at Step ${placedItems.length + 1} (${bestPlacement.dimension.rotationType})`,
      };

      placedItems.push(newPlaced);
      placedMap.set(placedId, newPlaced);

      // Propagate weight to underlying items
      addWeightToStackHierarchy(bestPlacement.underlyingItems, item.weight, placedMap);

      currentTotalWeightKg += item.weight;
      currentTotalCargoVolumeMm3 +=
        bestPlacement.dimension.length *
        bestPlacement.dimension.width *
        bestPlacement.dimension.height;

      // Update Extreme Points
      extremePoints = updateExtremePoints(extremePoints, newPlaced, placedItems, vehicle);
    } else {
      unplacedItems.push({
        item,
        quantityUnplaced: 1,
        reason: 'no_fitting_space',
        details: `No remaining continuous space in vehicle satisfies dimensions (${item.length}x${item.width}x${item.height}mm) and support constraints.`,
      });
    }
  }

  // 4. Compute Volume and Utilization metrics
  const vehicleVolumeM3 = (vehicle.length * vehicle.width * vehicle.height) / 1e9;
  const totalCargoVolumeM3 = currentTotalCargoVolumeMm3 / 1e9;
  const volumeUtilizationPercent =
    vehicleVolumeM3 > 0 ? Math.min(100, Math.round((totalCargoVolumeM3 / vehicleVolumeM3) * 1000) / 10) : 0;

  const weightUtilizationPercent =
    vehicle.maxPayloadKg > 0 ? Math.min(100, Math.round((currentTotalWeightKg / vehicle.maxPayloadKg) * 1000) / 10) : 0;

  // 5. Compute Center of Gravity & Axle Distribution
  const centerOfGravity = calculateCenterOfGravity(vehicle, placedItems);

  const endTime = performance.now();

  return {
    vehicle,
    placedItems,
    unplacedItems,
    totalPackedItemsCount: placedItems.length,
    totalUnplacedItemsCount: unplacedItems.length,
    totalCargoVolumeM3: Math.round(totalCargoVolumeM3 * 100) / 100,
    vehicleVolumeM3: Math.round(vehicleVolumeM3 * 100) / 100,
    volumeUtilizationPercent,
    totalCargoWeightKg: currentTotalWeightKg,
    maxPayloadKg: vehicle.maxPayloadKg,
    weightUtilizationPercent,
    centerOfGravity,
    calculationTimeMs: Math.round(endTime - startTime),
    timestamp: new Date().toISOString(),
  };
}
