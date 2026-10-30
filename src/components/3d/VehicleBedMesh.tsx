'use client';

import React from 'react';
import { VehicleContainer } from '@/lib/types/packing';
import { Line, Text } from '@react-three/drei';

interface VehicleBedMeshProps {
  vehicle: VehicleContainer;
  showWalls: boolean;
}

export const VehicleBedMesh: React.FC<VehicleBedMeshProps> = ({ vehicle, showWalls }) => {
  // Convert mm to meters for Three.js scene scale
  const lengthM = vehicle.length / 1000;
  const widthM = vehicle.width / 1000;
  const heightM = vehicle.height / 1000;

  // Cab dimensions for visual context
  const cabLengthM = Math.min(2.2, lengthM * 0.28);
  const cabHeightM = Math.min(2.8, heightM * 1.15);
  const cabWidthM = widthM * 0.95;

  return (
    <group>
      {/* 1. Heavy Industrial Truck Bed / Floor */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[lengthM, 0.1, widthM]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Bed Grid Line Pattern */}
      <gridHelper
        args={[Math.max(lengthM, widthM) * 1.2, Math.round(Math.max(lengthM, widthM) * 2), '#64748b', '#334155']}
        position={[0, 0.002, 0]}
      />

      {/* 2. Container Outer Envelope / Enclosure Wireframe */}
      {showWalls && (
        <group>
          {/* Transparent container shell */}
          <mesh position={[0, heightM / 2, 0]}>
            <boxGeometry args={[lengthM, heightM, widthM]} />
            <meshStandardMaterial
              color="#38bdf8"
              transparent
              opacity={0.06}
              roughness={0.1}
              metalness={0.1}
              depthWrite={false}
            />
          </mesh>

          {/* Solid Container Frame Edge Posts */}
          {/* Front Wall (behind Cab) */}
          <mesh position={[-lengthM / 2 + 0.02, heightM / 2, 0]}>
            <boxGeometry args={[0.04, heightM, widthM]} />
            <meshStandardMaterial color="#475569" roughness={0.5} transparent opacity={0.35} />
          </mesh>

          {/* Roof Edge Ribs / Bounding Cage */}
          <Line
            points={[
              [-lengthM / 2, heightM, -widthM / 2],
              [lengthM / 2, heightM, -widthM / 2],
              [lengthM / 2, heightM, widthM / 2],
              [-lengthM / 2, heightM, widthM / 2],
              [-lengthM / 2, heightM, -widthM / 2],
            ]}
            color="#0284c7"
            lineWidth={2}
          />
          <Line
            points={[
              [-lengthM / 2, 0, -widthM / 2],
              [-lengthM / 2, heightM, -widthM / 2],
            ]}
            color="#0284c7"
            lineWidth={2}
          />
          <Line
            points={[
              [-lengthM / 2, 0, widthM / 2],
              [-lengthM / 2, heightM, widthM / 2],
            ]}
            color="#0284c7"
            lineWidth={2}
          />
          <Line
            points={[
              [lengthM / 2, 0, -widthM / 2],
              [lengthM / 2, heightM, -widthM / 2],
            ]}
            color="#0284c7"
            lineWidth={2}
          />
          <Line
            points={[
              [lengthM / 2, 0, widthM / 2],
              [lengthM / 2, heightM, widthM / 2],
            ]}
            color="#0284c7"
            lineWidth={2}
          />
        </group>
      )}

      {/* 3. Driver Cab Visual Representation (Located at -X: Front) */}
      <group position={[-lengthM / 2 - cabLengthM / 2 - 0.15, cabHeightM / 2 - 0.05, 0]}>
        {/* Cab Main Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[cabLengthM, cabHeightM, cabWidthM]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.6} />
        </mesh>

        {/* Cab Windshield */}
        <mesh position={[-cabLengthM / 2 - 0.01, cabHeightM * 0.2, 0]}>
          <boxGeometry args={[0.02, cabHeightM * 0.45, cabWidthM * 0.85]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.8} />
        </mesh>

        {/* Cab Front Wheels */}
        <mesh position={[-cabLengthM * 0.2, -cabHeightM / 2 + 0.35, cabWidthM / 2 + 0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.28, 24]} />
          <meshStandardMaterial color="#18181b" roughness={0.9} />
        </mesh>
        <mesh position={[-cabLengthM * 0.2, -cabHeightM / 2 + 0.35, -cabWidthM / 2 - 0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.28, 24]} />
          <meshStandardMaterial color="#18181b" roughness={0.9} />
        </mesh>
      </group>

      {/* 4. Rear Wheels beneath cargo bed */}
      <group position={[lengthM * 0.25, -0.4, 0]}>
        {/* Axle 1 */}
        <mesh position={[0, 0, widthM / 2 + 0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.26, 24]} />
          <meshStandardMaterial color="#18181b" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0, -widthM / 2 - 0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.26, 24]} />
          <meshStandardMaterial color="#18181b" roughness={0.9} />
        </mesh>

        {/* Axle 2 (Tandem) */}
        {lengthM > 6 && (
          <>
            <mesh position={[1.1, 0, widthM / 2 + 0.05]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.42, 0.42, 0.26, 24]} />
              <meshStandardMaterial color="#18181b" roughness={0.9} />
            </mesh>
            <mesh position={[1.1, 0, -widthM / 2 - 0.05]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.42, 0.42, 0.26, 24]} />
              <meshStandardMaterial color="#18181b" roughness={0.9} />
            </mesh>
          </>
        )}
      </group>

      {/* 5. 3D Dimension Labels in the scene */}
      {/* Length Dimension Label */}
      <Text
        position={[0, -0.25, widthM / 2 + 0.45]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.24}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        {`LENGTH: ${(vehicle.length / 1000).toFixed(2)}m (${vehicle.length}mm)`}
      </Text>

      {/* Width Dimension Label */}
      <Text
        position={[lengthM / 2 + 0.5, -0.25, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        fontSize={0.24}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        {`WIDTH: ${(vehicle.width / 1000).toFixed(2)}m (${vehicle.width}mm)`}
      </Text>

      {/* Rear Loading Gate Direction Indicator */}
      <Text
        position={[lengthM / 2, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        fontSize={0.22}
        color="#38bdf8"
        anchorX="center"
        anchorY="middle"
      >
        ▼ REAR LOADING DOOR ▼
      </Text>

      {/* Front Cab Direction Indicator */}
      <Text
        position={[-lengthM / 2 + 0.35, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        fontSize={0.22}
        color="#cbd5e1"
        anchorX="center"
        anchorY="middle"
      >
        ▲ FRONT (CABIN NOSE) ▲
      </Text>
    </group>
  );
};
