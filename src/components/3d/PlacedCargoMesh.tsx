'use client';

import React, { useState } from 'react';
import { PlacedItem, VehicleContainer } from '@/lib/types/packing';
import { Edges, Text } from '@react-three/drei';
import { usePlannerStore } from '@/lib/store/usePlannerStore';

interface PlacedCargoMeshProps {
  item: PlacedItem;
  vehicle: VehicleContainer;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

// Electric High-Vis Fluorescent Lime/Yellow - totally outside standard palette
const HIGH_VIS_HOVER_COLOR = '#d4ff00';
const SELECTION_COLOR = '#ff6b00';

export const PlacedCargoMesh: React.FC<PlacedCargoMeshProps> = ({
  item,
  vehicle,
  isSelected,
  onSelect,
}) => {
  const [localHovered, setLocalHovered] = useState(false);
  const { hoveredItemId, setHoveredItemId } = usePlannerStore();

  // Bidirectional hover: active if directly hovered in 3D OR hovered in the left Catalog
  const isHovered = localHovered || hoveredItemId === item.itemId || hoveredItemId === item.id;

  // Convert mm to meters for Three.js
  const lM = item.dimensions.length / 1000;
  const wM = item.dimensions.width / 1000;
  const hM = item.dimensions.height / 1000;

  // Center coordinate mapping (Vehicle center is at 0, 0, 0)
  const posX = (item.position.x + item.dimensions.length / 2 - vehicle.length / 2) / 1000;
  const posY = (item.position.z + item.dimensions.height / 2) / 1000;
  const posZ = (item.position.y + item.dimensions.width / 2 - vehicle.width / 2) / 1000;

  // Visual text sizing
  const textSize = Math.min(0.2, Math.min(lM, wM) * 0.38);

  return (
    <group position={[posX, posY, posZ]}>
      {/* 3D Cargo Box Mesh */}
      <mesh
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect(item.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setLocalHovered(true);
          setHoveredItemId(item.itemId);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setLocalHovered(false);
          setHoveredItemId(null);
          document.body.style.cursor = 'auto';
        }}
      >
        <boxGeometry args={[lM, hM, wM]} />
        <meshStandardMaterial
          color={
            isSelected
              ? SELECTION_COLOR
              : isHovered
              ? HIGH_VIS_HOVER_COLOR
              : item.color || '#0284c7'
          }
          emissive={
            isSelected
              ? SELECTION_COLOR
              : isHovered
              ? HIGH_VIS_HOVER_COLOR
              : '#000000'
          }
          emissiveIntensity={isSelected ? 0.35 : isHovered ? 0.45 : 0}
          roughness={isHovered ? 0.15 : 0.35}
          metalness={isHovered ? 0.3 : 0.2}
          transparent={isHovered}
          opacity={isHovered ? 0.95 : 1.0}
        />
        {/* Crisp Geometric Outlines - High contrast black outline when hovered */}
        <Edges
          scale={1}
          threshold={15}
          color={
            isSelected
              ? '#ffffff'
              : isHovered
              ? '#000000'
              : '#0f172a'
          }
          lineWidth={isSelected ? 3 : isHovered ? 2.8 : 1.2}
        />
      </mesh>

      {/* Step Sequence Badge on Top Face */}
      {hM > 0.08 && (
        <Text
          position={[0, hM / 2 + 0.005, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={textSize}
          color={isHovered ? '#000000' : '#ffffff'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={isHovered ? 0.005 : 0.015}
          outlineColor={isHovered ? '#ffffff' : '#0f172a'}
        >
          {`#${item.stepNumber}`}
        </Text>
      )}

      {/* Item Name on Side Face if large enough */}
      {lM > 0.7 && hM > 0.35 && (
        <Text
          position={[0, 0, wM / 2 + 0.005]}
          fontSize={Math.min(0.13, hM * 0.22)}
          color={isHovered ? '#000000' : '#ffffff'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor={isHovered ? '#ffffff' : '#0f172a'}
        >
          {item.name.length > 16 ? item.name.substring(0, 14) + '...' : item.name}
        </Text>
      )}
    </group>
  );
};
