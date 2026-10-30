'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { usePlannerStore } from '@/lib/store/usePlannerStore';
import { VehicleBedMesh } from './VehicleBedMesh';
import { PlacedCargoMesh } from './PlacedCargoMesh';
import { CenterOfGravityMarker } from './CenterOfGravityMarker';
import { ViewControls } from './ViewControls';

// Component inside the Canvas to handle camera movements
const CameraHandler: React.FC<{ lengthM: number; widthM: number; heightM: number }> = ({
  lengthM,
  widthM,
  heightM,
}) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { cameraView } = usePlannerStore();

  useEffect(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    const target = new THREE.Vector3(0, heightM * 0.35, 0);

    let eye = new THREE.Vector3();

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

    controls.target.copy(target);
    controls.object.position.copy(eye);
    controls.update();
  }, [cameraView, lengthM, widthM, heightM]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      minDistance={1.5}
      maxDistance={40}
      maxPolarAngle={Math.PI / 2 + 0.05} // Do not dip far below floor
    />
  );
};

export const LoadingScene3D: React.FC = () => {
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

  return (
    <div className="relative w-full h-full min-h-[480px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* 3D Viewport Controls Overlay */}
      <ViewControls />

      {/* Selected Item Floating Inspector Card */}
      {selectedItemDetail && (
        <div className="absolute top-4 right-4 z-10 w-72 bg-slate-900/90 backdrop-blur-md border border-sky-500/40 p-4 rounded-xl shadow-2xl text-xs text-slate-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/60">
            <div className="font-semibold text-sky-400 truncate pr-2">{selectedItemDetail.name}</div>
            <button
              onClick={() => setSelectedPlacedItemId(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Loading Step:</span>
              <span className="font-bold text-sky-400">#{selectedItemDetail.stepNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Placed Dimensions:</span>
              <span className="font-mono text-slate-100">
                {selectedItemDetail.dimensions.length} × {selectedItemDetail.dimensions.width} ×{' '}
                {selectedItemDetail.dimensions.height} mm
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Weight:</span>
              <span className="font-semibold text-slate-100">{selectedItemDetail.weight} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Coordinates (X, Y, Z):</span>
              <span className="font-mono text-slate-100">
                ({selectedItemDetail.position.x}, {selectedItemDetail.position.y},{' '}
                {selectedItemDetail.position.z}) mm
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Base Support:</span>
              <span className="text-emerald-400 font-medium">
                {selectedItemDetail.supportedAreaPercent}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Stack Load Above:</span>
              <span className="text-amber-400 font-medium">
                {selectedItemDetail.stackWeightAboveKg} kg
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Three.js Canvas */}
      <Canvas
        shadows
        camera={{
          position: [lengthM * 0.9, heightM * 1.6, widthM * 1.4],
          fov: 42,
          near: 0.1,
          far: 100,
        }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[10, 15, 8]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <hemisphereLight args={['#bae6fd', '#0f172a', 0.5]} />

        {/* Vehicle Bed, Cab, Frame */}
        <VehicleBedMesh vehicle={selectedVehicle} showWalls={showContainerWalls} />

        {/* Placed Cargo Boxes */}
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
