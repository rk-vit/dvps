'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useTheme } from 'next-themes';
import { usePlannerStore } from '@/lib/store/usePlannerStore';
import { VehicleBedMesh } from './VehicleBedMesh';
import { PlacedCargoMesh } from './PlacedCargoMesh';
import { CenterOfGravityMarker } from './CenterOfGravityMarker';
import { ViewControls } from './ViewControls';

// Component inside the Canvas to handle smooth camera transitions
const CameraHandler: React.FC<{ lengthM: number; widthM: number; heightM: number }> = ({
  lengthM,
  widthM,
  heightM,
}) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { cameraView } = usePlannerStore();
  const desiredPosition = useRef<THREE.Vector3 | null>(null);
  const targetLookAt = useRef(new THREE.Vector3(0, heightM * 0.35, 0));

  useEffect(() => {
    targetLookAt.current.set(0, heightM * 0.35, 0);
    const eye = new THREE.Vector3();

    switch (cameraView) {
      case 'top':
        eye.set(0, Math.max(lengthM, widthM) * 1.5, 0.001);
        break;
      case 'side':
        eye.set(0, heightM * 0.6, widthM * 2.2);
        break;
      case 'rear':
        eye.set(lengthM * 1.35, heightM * 0.7, 0);
        break;
      case 'isometric':
      default:
        eye.set(lengthM * 0.85, heightM * 1.6, widthM * 1.35);
        break;
    }

    desiredPosition.current = eye;
  }, [cameraView, lengthM, widthM, heightM]);

  // Smooth cinematic lerp animation between viewpoints
  useFrame((state, delta) => {
    if (desiredPosition.current && controlsRef.current) {
      state.camera.position.lerp(desiredPosition.current, Math.min(1, delta * 6));
      controlsRef.current.target.lerp(targetLookAt.current, Math.min(1, delta * 6));
      controlsRef.current.update();

      if (state.camera.position.distanceTo(desiredPosition.current) < 0.03) {
        desiredPosition.current = null;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.7}
      zoomSpeed={0.8}
      panSpeed={0.8}
      minDistance={1.2}
      maxDistance={45}
      maxPolarAngle={Math.PI / 2 + 0.02} // Ground collision constraint
    />
  );
};

export const LoadingScene3D: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const {
    selectedVehicle,
    packingResult,
    activeStep,
    selectedPlacedItemId,
    setSelectedPlacedItemId,
    showContainerWalls,
    showCoGIndicator,
    cutawayHeightPercent,
  } = usePlannerStore();

  const lengthM = selectedVehicle.length / 1000;
  const widthM = selectedVehicle.width / 1000;
  const heightM = selectedVehicle.height / 1000;

  // Filter items visible at the active loading step and cutaway plane
  const maxZMm = (selectedVehicle.height * cutawayHeightPercent) / 100;
  const visibleItems =
    packingResult?.placedItems.filter((item) => {
      const isWithinStep = item.stepNumber <= activeStep;
      const isWithinCutaway = item.position.z <= maxZMm + 5;
      return isWithinStep && isWithinCutaway;
    }) || [];

  const selectedItemDetail = packingResult?.placedItems.find(
    (item) => item.id === selectedPlacedItemId
  );

  const isRotated = selectedItemDetail && (
    selectedItemDetail.dimensions.length !== selectedItemDetail.originalDimensions.length ||
    selectedItemDetail.dimensions.width !== selectedItemDetail.originalDimensions.width ||
    selectedItemDetail.dimensions.height !== selectedItemDetail.originalDimensions.height
  );

  return (
    <div className="relative w-full h-full min-h-[520px] bg-neutral-100 dark:bg-[#0c0c0e] rounded-xl overflow-hidden border border-border shadow-xs transition-colors">
      {/* 3D Viewport Controls Overlay */}
      <ViewControls />

      {/* Selected Item Floating Inspector Card */}
      {selectedItemDetail && (
        <div className="absolute top-3 right-3 z-10 w-72 bg-card/95 backdrop-blur-md border border-border p-3.5 rounded-xl shadow-lg text-xs text-foreground transition-colors">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
            <div className="font-semibold truncate pr-2">{selectedItemDetail.name}</div>
            <button
              onClick={() => setSelectedPlacedItemId(null)}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Loading Step:</span>
              <span className="font-bold text-foreground">#{selectedItemDetail.stepNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Original SKU:</span>
              <span className="text-muted-foreground">
                {selectedItemDetail.originalDimensions.length} × {selectedItemDetail.originalDimensions.width} ×{' '}
                {selectedItemDetail.originalDimensions.height} mm
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Placed in Bed:</span>
              <span className="font-bold text-foreground">
                {selectedItemDetail.dimensions.length} × {selectedItemDetail.dimensions.width} ×{' '}
                {selectedItemDetail.dimensions.height} mm
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">3D Orientation:</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                  isRotated
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                }`}
              >
                {isRotated ? '↻ Rotated on Side (to fit bed)' : '✓ Standard Flat (0°)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Weight:</span>
              <span className="font-semibold text-foreground">{selectedItemDetail.weight} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Coordinates:</span>
              <span className="text-foreground">
                ({selectedItemDetail.position.x}, {selectedItemDetail.position.y},{' '}
                {selectedItemDetail.position.z}) mm
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base Support:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {selectedItemDetail.supportedAreaPercent}% (Solid)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stack Load Above:</span>
              <span className="text-foreground">
                {selectedItemDetail.stackWeightAboveKg} kg
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Three.js Canvas */}
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{
          position: [lengthM * 0.85, heightM * 1.6, widthM * 1.35],
          fov: 42,
          near: 0.1,
          far: 100,
        }}
        className="w-full h-full"
      >
        <ambientLight intensity={isDark ? 0.75 : 0.95} />
        <directionalLight
          position={[10, 15, 8]}
          intensity={isDark ? 1.2 : 1.4}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <hemisphereLight
          args={
            isDark
              ? ['#bae6fd', '#0f172a', 0.4]
              : ['#ffffff', '#cbd5e1', 0.6]
          }
        />

        {/* Realistic Ground Contact Shadows */}
        <ContactShadows
          position={[0, -0.42, 0]}
          opacity={isDark ? 0.8 : 0.4}
          scale={lengthM * 1.5}
          blur={1.4}
          far={3}
          color={isDark ? '#000000' : '#334155'}
        />

        {/* Realistic Vehicle Bed, Chassis, Cab, Wheels */}
        <VehicleBedMesh vehicle={selectedVehicle} showWalls={showContainerWalls} isDark={isDark} />

        {/* Placed Cargo Boxes with Beveled Edges & High-Vis Hover */}
        {visibleItems.map((item) => (
          <PlacedCargoMesh
            key={item.id}
            item={item}
            vehicle={selectedVehicle}
            isSelected={item.id === selectedPlacedItemId}
            onSelect={setSelectedPlacedItemId}
          />
        ))}

        {/* Center of Gravity Marker */}
        {showCoGIndicator && packingResult && (
          <CenterOfGravityMarker cog={packingResult.centerOfGravity} vehicle={selectedVehicle} />
        )}

        <CameraHandler lengthM={lengthM} widthM={widthM} heightM={heightM} />
      </Canvas>
    </div>
  );
};
