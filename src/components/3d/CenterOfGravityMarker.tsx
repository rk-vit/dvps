'use client';

import React from 'react';
import { CenterOfGravity, VehicleContainer } from '@/lib/types/packing';
import { Line, Text } from '@react-three/drei';

interface CenterOfGravityMarkerProps {
  cog: CenterOfGravity;
  vehicle: VehicleContainer;
}

export const CenterOfGravityMarker: React.FC<CenterOfGravityMarkerProps> = ({ cog, vehicle }) => {
  // Convert mm to meters and map to Three.js coordinates
  const posX = (cog.x - vehicle.length / 2) / 1000;
  const posY = cog.z / 1000;
  const posZ = (cog.y - vehicle.width / 2) / 1000;

  const isImbalanced = cog.isLaterallyImbalanced || cog.isLongitudinallyImbalanced;
  const markerColor = isImbalanced ? '#ef4444' : '#10b981';

  return (
    <group position={[posX, 0, posZ]}>
      {/* Target Reticle on Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[0.2, 0.28, 32]} />
        <meshBasicMaterial color={markerColor} transparent opacity={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[0.08, 32]} />
        <meshBasicMaterial color={markerColor} />
      </mesh>

      {/* Vertical Laser/Beam reaching the 3D elevation of CoG */}
      <Line
        points={[
          [0, 0, 0],
          [0, Math.max(0.3, posY), 0],
        ]}
        color={markerColor}
        lineWidth={3}
      />

      {/* Glowing 3D Sphere at Elevation */}
      <mesh position={[0, Math.max(0.3, posY), 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color={markerColor}
          emissive={markerColor}
          emissiveIntensity={0.6}
          roughness={0.2}
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, Math.max(0.3, posY) + 0.25, 0]}
        fontSize={0.16}
        color={markerColor}
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {`CoG (Z: ${cog.z}mm)`}
      </Text>
    </group>
  );
};
