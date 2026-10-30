import { CargoItem, OrientationRestriction } from '../types/packing';

export interface RotatedDimension {
  length: number; // Size along container X (Length)
  width: number;  // Size along container Y (Width)
  height: number; // Size along container Z (Height)
  rotationType: string;
}

/**
 * Returns all physically permissible 3D rotations for a given item based on its orientation constraint.
 * Eliminates duplicate orientations when dimensions are identical (e.g. square items or cubes).
 */
export function getPermissibleOrientations(item: CargoItem): RotatedDimension[] {
  const { length: l, width: w, height: h, orientation } = item;
  const candidates: RotatedDimension[] = [];

  switch (orientation) {
    case 'locked':
      // Strict single orientation: keep as provided
      candidates.push({ length: l, width: w, height: h, rotationType: 'Original' });
      break;

    case 'upright_only':
      // Height dimension must stay vertical along Z. Can only rotate 0° or 90° horizontally.
      candidates.push({ length: l, width: w, height: h, rotationType: 'Upright (0°)' });
      if (l !== w) {
        candidates.push({ length: w, width: l, height: h, rotationType: 'Upright (90°)' });
      }
      break;

    case 'lengthwise':
      // Item's longest dimension must align along the vehicle length (X axis) to prevent overhang
      const dims = [l, w, h].sort((a, b) => b - a);
      const longest = dims[0];
      const other1 = dims[1];
      const other2 = dims[2];

      candidates.push({ length: longest, width: other1, height: other2, rotationType: 'Lengthwise (Flat)' });
      if (other1 !== other2) {
        candidates.push({ length: longest, width: other2, height: other1, rotationType: 'Lengthwise (On-Edge)' });
      }
      break;

    case 'flat_only':
      // Must be placed on its largest footprint (largest face down), but can rotate 90° horizontally
      const sortedDims = [l, w, h].sort((a, b) => a - b);
      const minH = sortedDims[0]; // shortest dimension becomes height
      const faceL = sortedDims[2];
      const faceW = sortedDims[1];

      candidates.push({ length: faceL, width: faceW, height: minH, rotationType: 'Flat (0°)' });
      if (faceL !== faceW) {
        candidates.push({ length: faceW, width: faceL, height: minH, rotationType: 'Flat (90°)' });
      }
      break;

    case 'any':
    default:
      // All 6 3D permutations permitted
      const allSix: RotatedDimension[] = [
        { length: l, width: w, height: h, rotationType: 'XYZ' },
        { length: l, width: h, height: w, rotationType: 'XZY' },
        { length: w, width: l, height: h, rotationType: 'YXZ' },
        { length: w, width: h, height: l, rotationType: 'YZX' },
        { length: h, width: l, height: w, rotationType: 'ZXY' },
        { length: h, width: w, height: l, rotationType: 'ZYX' },
      ];

      // Remove duplicates for symmetric dimensions
      for (const orient of allSix) {
        const isDuplicate = candidates.some(
          (c) => c.length === orient.length && c.width === orient.width && c.height === orient.height
        );
        if (!isDuplicate) {
          candidates.push(orient);
        }
      }
      break;
  }

  return candidates;
}
