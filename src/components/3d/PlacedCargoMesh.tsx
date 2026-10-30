'use client';

import React, { useState } from 'react';
import { PlacedItem, VehicleContainer } from '@/lib/types/packing';
import { Edges, Text } from '@react-three/drei';

interface PlacedCargoMeshProps {
  item: PlacedItem;
  vehicle: VehicleContainer;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const PlacedCargoMesh: React.FC<PlacedCargoMeshProps> = ({
  item,
  vehicle,
  isSelected,
  onSelect,
}) => {
  const [hovered, setHovered] = useState(false);

  // Convert mm to meters for Three.js
  const lM = item.dimensions.length / 1000;
  const wM = item.dimensions.width / 1000;
  const hM = item.dimensions.height / 1000;

  // Center coordinate mapping (Vehicle center is at 0, 0, 0)
  // X: Front (-L/2) to Back (+L/2)
  // Y: Floor (0) to Top (+H)
  // Z: Left (-W/2) to Right (+W/2)
  const posX = (item.position.x + item.dimensions.length / 2 - vehicle.length / 2) / 1000;
  const posY = (item.position.z + item.dimensions.height / 2) / 1000;
  const posZ = (item.position.y + item.dimensions.width / 2 - vehicle.width / 2) / 1000;

  // Visual text sizing
  const textSize = Math.min(0.22, Math.min(lM, wM) * 0.4);

  return (
    <group position={[posX, posY, posZ]}>
      {/* 3D Box Mesh */}
      <mesh
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect(item.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <boxGeometry args={[lM, hM, wM]} />
        <meshStandardMaterial
          color={isSelected ? '#f59e0b' : hovered ? '#60a5fa' : item.color || '#3b82f6'}
          roughness={0.35}
          metalness={0.15}
          transparent={hovered}
          opacity={hovered ? 0.9 : 1.0}
        />
        {/* Crisp Outlines */}
        <Edges
          scale={1}
          threshold={15}
          color={isSelected ? '#ffffff' : hovered ? '#ffffff' : '#0f172a'}
          lineWidth={isSelected ? 3 : 1.5}
        />
      </mesh>

      {/* Step Sequence Badge on Top Face */}
      {hM > 0.1 && (
        <Text
          position={[0, hM / 2 + 0.005, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={textSize}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.015}
          outlineColor="#0f172a"
        >
          {`#${item.stepNumber}`}
        </Text>
      )}

      {/* Item Name on Side Face if large enough */}
      {lM > 0.8 && hM > 0.4 && (
        <Text
          position={[0, 0, wM / 2 + 0.005]}
          fontSize={Math.min(0.14, hM * 0.25)}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#0f172a"
        >
          {item.name.length > 18 ? item.name.substring(0, 16) + '...' : item.name}
        </Text>
      )}
    </group>
  );
};
