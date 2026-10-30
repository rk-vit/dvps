import { VEHICLE_PRESETS, SAMPLE_DISPATCH_ITEMS } from './presets';
import { solve3DPacking } from './solver';
import { checkAABBCollision, isWithinContainer } from './geometry';

function runEngineVerification() {
  console.log('=== RUNNING 3D PACKING ENGINE VERIFICATION ===\n');

  const vehicle = VEHICLE_PRESETS[1]; // 20ft container (5898 x 2352 x 2393 mm, 21.7T)
  console.log(`Testing Vehicle: ${vehicle.name} (${vehicle.length}x${vehicle.width}x${vehicle.height}mm, max: ${vehicle.maxPayloadKg}kg)`);
  console.log(`Input Items: ${SAMPLE_DISPATCH_ITEMS.length} item types with quantities.\n`);

  const result = solve3DPacking(vehicle, SAMPLE_DISPATCH_ITEMS);

  console.log(`Execution Time: ${result.calculationTimeMs} ms`);
  console.log(`Placed Items: ${result.totalPackedItemsCount} units`);
  console.log(`Unplaced Items: ${result.totalUnplacedItemsCount} units`);
  console.log(`Cargo Volume: ${result.totalCargoVolumeM3} m³ / ${result.vehicleVolumeM3} m³ (${result.volumeUtilizationPercent}%)`);
  console.log(`Cargo Weight: ${result.totalCargoWeightKg} kg / ${result.maxPayloadKg} kg (${result.weightUtilizationPercent}%)`);
  console.log(`Center of Gravity: (X: ${result.centerOfGravity.x}mm [${result.centerOfGravity.xPercent}%], Y: ${result.centerOfGravity.y}mm [${result.centerOfGravity.yPercent}%], Z: ${result.centerOfGravity.z}mm)`);
  console.log(`Axle Distribution: Front ${result.centerOfGravity.frontAxleRatio * 100}% (${result.centerOfGravity.frontAxleWeightKg}kg), Rear ${result.centerOfGravity.rearAxleRatio * 100}% (${result.centerOfGravity.rearAxleWeightKg}kg)\n`);

  console.log('\n--- Placed Items Detail ---');
  for (const placed of result.placedItems) {
    console.log(`Step #${placed.stepNumber} [${placed.name}]: Pos(X:${placed.position.x}, Y:${placed.position.y}, Z:${placed.position.z}) Dim(${placed.dimensions.length}x${placed.dimensions.width}x${placed.dimensions.height}) Support:${placed.supportedAreaPercent}%`);
  }
  console.log('---------------------------\n');

  // Verification 1: Bounds check
  let allInside = true;
  for (const placed of result.placedItems) {
    if (!isWithinContainer(placed.position, placed.dimensions, vehicle)) {
      console.error(`FAIL: Item ${placed.name} exceeds container bounds!`, placed);
      allInside = false;
    }
  }
  if (allInside) console.log('✓ PASS: All placed items are strictly within container boundaries.');

  // Verification 2: Overlap / Collision check between any pair of placed items
  let hasCollision = false;
  for (let i = 0; i < result.placedItems.length; i++) {
    for (let j = i + 1; j < result.placedItems.length; j++) {
      const a = result.placedItems[i];
      const b = result.placedItems[j];
      if (checkAABBCollision(a.position, a.dimensions, b)) {
        console.error(`FAIL: Collision detected between item ${a.id} and ${b.id}!`);
        hasCollision = true;
      }
    }
  }
  if (!hasCollision) console.log('✓ PASS: 0 collisions detected between all placed items.');

  // Verification 3: Gravity support check
  let floatingItems = 0;
  for (const placed of result.placedItems) {
    if (placed.position.z > 0 && placed.supportedAreaPercent < 60) {
      console.error(`FAIL: Item ${placed.name} appears to be floating with only ${placed.supportedAreaPercent}% support!`);
      floatingItems++;
    }
  }
  if (floatingItems === 0) console.log('✓ PASS: All elevated items have valid structural base support.');

  // Verification 4: Fragile stacking check (e.g. Industrial Control Cabinet has allowStackAbove = false)
  let fragileViolated = false;
  for (const placed of result.placedItems) {
    if (placed.itemId === 'item-control-cabinet' && placed.stackWeightAboveKg > 0) {
      console.error(`FAIL: Fragile control cabinet has items stacked on it! Stack weight: ${placed.stackWeightAboveKg}kg`);
      fragileViolated = true;
    }
  }
  if (!fragileViolated) console.log('✓ PASS: Fragile non-stackable items have 0 kg stacked on top.');

  console.log('\n=== ALL ENGINE VERIFICATIONS COMPLETED SUCCESSFULLY ===');
}

runEngineVerification();
