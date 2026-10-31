'use client';

import React from 'react';
import { VehicleContainer } from '@/lib/types/packing';
import { Line, Text, RoundedBox } from '@react-three/drei';

interface VehicleBedMeshProps {
  vehicle: VehicleContainer;
  showWalls: boolean;
  isDark?: boolean;
}

/**
 * Detailed 3D Transport Vehicle with Chassis, Cab, Dual Wheel Axles,
 * Mudguards, Fuel Tanks, Headboard, and Dimension Markings.
 */
export const VehicleBedMesh: React.FC<VehicleBedMeshProps> = ({
  vehicle,
  showWalls,
  isDark = true,
}) => {
  // Convert mm to meters for Three.js scene scale
  const lengthM = vehicle.length / 1000;
  const widthM = vehicle.width / 1000;
  const heightM = vehicle.height / 1000;

  // Cab proportions
  const cabLengthM = Math.min(2.4, Math.max(1.8, lengthM * 0.24));
  const cabHeightM = Math.min(2.9, Math.max(2.2, heightM * 1.1));
  const cabWidthM = widthM * 0.92;
  const chassisDrop = 0.35; // Vertical distance below bed for chassis rails

  // Color Palette depending on Light / Dark theme
  const bedFloorColor = isDark ? '#1e293b' : '#cbd5e1';
  const chassisColor = isDark ? '#0f172a' : '#334155';
  const cabBodyColor = isDark ? '#1e293b' : '#475569';
  const cabAccentColor = isDark ? '#0ea5e9' : '#0284c7';
  const tireColor = '#18181b';
  const rimColor = isDark ? '#64748b' : '#94a3b8';
  const glassColor = isDark ? '#0284c7' : '#38bdf8';
  const cageColor = isDark ? '#38bdf8' : '#334155';
  const textColor = isDark ? '#94a3b8' : '#475569';
  const metallicTankColor = isDark ? '#475569' : '#94a3b8';

  return (
    <group>
      {/* ─────────────────────────────────────────────────────────────
          1. REINFORCED CARGO BED FLOOR & HEADBOARD
      ───────────────────────────────────────────────────────────── */}
      {/* Heavy Cargo Bed Surface */}
      <mesh position={[0, -0.04, 0]} receiveShadow>
        <boxGeometry args={[lengthM, 0.08, widthM]} />
        <meshStandardMaterial
          color={bedFloorColor}
          roughness={0.7}
          metalness={0.25}
        />
      </mesh>

      {/* Bed Grid Line Pattern (Anti-Slip / Alignment Markers) */}
      <gridHelper
        args={[
          Math.max(lengthM, widthM) * 1.15,
          Math.round(Math.max(lengthM, widthM) * 2),
          isDark ? '#475569' : '#94a3b8',
          isDark ? '#334155' : '#e2e8f0',
        ]}
        position={[0, 0.002, 0]}
      />

      {/* Front Heavy Bulkhead / Headboard Wall (Safety Barrier behind Driver) */}
      <group position={[-lengthM / 2 + 0.03, heightM * 0.45, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.06, heightM * 0.9, widthM]} />
          <meshStandardMaterial
            color={chassisColor}
            roughness={0.5}
            metalness={0.4}
          />
        </mesh>
        {/* Headboard Horizontal Reinforcement Ribs */}
        {[-0.3, 0, 0.3].map((yOffset, idx) => (
          <mesh key={idx} position={[0.035, yOffset * heightM * 0.6, 0]}>
            <boxGeometry args={[0.02, 0.06, widthM * 0.96]} />
            <meshStandardMaterial color={isDark ? '#334155' : '#64748b'} />
          </mesh>
        ))}
      </group>

      {/* Perimeter Rub-Rails / Tie-Down Edge Bars */}
      <mesh position={[0, 0.02, widthM / 2 + 0.02]}>
        <boxGeometry args={[lengthM, 0.04, 0.03]} />
        <meshStandardMaterial color={chassisColor} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.02, -widthM / 2 - 0.02]}>
        <boxGeometry args={[lengthM, 0.04, 0.03]} />
        <meshStandardMaterial color={chassisColor} metalness={0.5} />
      </mesh>

      {/* ─────────────────────────────────────────────────────────────
          2. STEEL CHASSIS FRAME RAILS & UNDERCARRIAGE EQUIPMENT
      ───────────────────────────────────────────────────────────── */}
      {/* Longitudinal Left and Right Frame Rails (C-Channel Beams) */}
      <group position={[-cabLengthM * 0.35, -chassisDrop, 0]}>
        <mesh position={[0, 0, widthM * 0.28]} castShadow>
          <boxGeometry args={[lengthM + cabLengthM * 0.7, 0.22, 0.08]} />
          <meshStandardMaterial color={chassisColor} metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, -widthM * 0.28]} castShadow>
          <boxGeometry args={[lengthM + cabLengthM * 0.7, 0.22, 0.08]} />
          <meshStandardMaterial color={chassisColor} metalness={0.6} roughness={0.4} />
        </mesh>

        {/* Transverse Cross-Members */}
        {[-0.3, -0.1, 0.1, 0.3].map((posFactor, idx) => (
          <mesh key={idx} position={[posFactor * lengthM, 0, 0]}>
            <boxGeometry args={[0.1, 0.14, widthM * 0.56]} />
            <meshStandardMaterial color={chassisColor} metalness={0.5} />
          </mesh>
        ))}

        {/* Cylindrical Aluminum Fuel Tank (Left Flank) */}
        <group position={[-lengthM * 0.15, -0.05, widthM / 2 + 0.02]} rotation={[0, 0, Math.PI / 2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.26, 0.26, 1.3, 24]} />
            <meshStandardMaterial color={metallicTankColor} metalness={0.8} roughness={0.25} />
          </mesh>
          {/* Tank mounting straps */}
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.27, 0.27, 0.05, 24]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, -0.45, 0]}>
            <cylinderGeometry args={[0.27, 0.27, 0.05, 24]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>

        {/* Battery / Utility Tool Box (Right Flank) */}
        <mesh position={[-lengthM * 0.15, -0.05, -widthM / 2 - 0.02]} castShadow>
          <boxGeometry args={[1.1, 0.38, 0.45]} />
          <meshStandardMaterial color={chassisColor} metalness={0.5} roughness={0.4} />
        </mesh>

        {/* Rear Underrun Protection Bumper Bar (ICC Bar) with Tail Lights */}
        <group position={[lengthM * 0.5 + 0.02, -0.05, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.14, widthM * 0.95]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.6} />
          </mesh>
          {/* Red Brake Lights */}
          <mesh position={[0.045, 0, widthM * 0.38]}>
            <boxGeometry args={[0.015, 0.08, 0.18]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0.045, 0, -widthM * 0.38]}>
            <boxGeometry args={[0.015, 0.08, 0.18]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.6} />
          </mesh>
        </group>
      </group>

      {/* ─────────────────────────────────────────────────────────────
          3. REALISTIC TANDEM DUAL-WHEEL AXLES & MUDGUARDS
      ───────────────────────────────────────────────────────────── */}
      {/* Front Steer Axle Wheels (Single tire per side) */}
      <group position={[-lengthM / 2 - cabLengthM * 0.45, -0.38, 0]}>
        {/* Left Front Wheel */}
        <group position={[0, 0, widthM / 2 + 0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.42, 0.42, 0.24, 32]} />
            <meshStandardMaterial color={tireColor} roughness={0.85} />
          </mesh>
          {/* Rim */}
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.26, 0.26, 0.245, 24]} />
            <meshStandardMaterial color={rimColor} metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
        {/* Right Front Wheel */}
        <group position={[0, 0, -widthM / 2 - 0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.42, 0.42, 0.24, 32]} />
            <meshStandardMaterial color={tireColor} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.02, 0]}>
            <cylinderGeometry args={[0.26, 0.26, 0.245, 24]} />
            <meshStandardMaterial color={rimColor} metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* Rear Tandem Drive Axles (Dual Twin Wheels per side + Curved Fenders) */}
      {[0.2, 0.4].map((xPct, axleIdx) => {
        // For short trucks, only render one rear axle
        if (axleIdx === 1 && lengthM < 5.5) return null;

        const axleX = lengthM * xPct;
        return (
          <group key={axleIdx} position={[axleX, -0.38, 0]}>
            {/* Dual Wheels Left Side (Inner + Outer Tire) */}
            <group position={[0, 0, widthM / 2 + 0.02]} rotation={[Math.PI / 2, 0, 0]}>
              {/* Outer Tire */}
              <mesh position={[0, 0.16, 0]} castShadow>
                <cylinderGeometry args={[0.42, 0.42, 0.22, 32]} />
                <meshStandardMaterial color={tireColor} roughness={0.85} />
              </mesh>
              {/* Outer Rim */}
              <mesh position={[0, 0.18, 0]}>
                <cylinderGeometry args={[0.25, 0.25, 0.225, 24]} />
                <meshStandardMaterial color={rimColor} metalness={0.8} roughness={0.2} />
              </mesh>

              {/* Inner Tire */}
              <mesh position={[0, -0.1, 0]} castShadow>
                <cylinderGeometry args={[0.42, 0.42, 0.22, 32]} />
                <meshStandardMaterial color={tireColor} roughness={0.85} />
              </mesh>
            </group>

            {/* Dual Wheels Right Side (Inner + Outer Tire) */}
            <group position={[0, 0, -widthM / 2 - 0.02]} rotation={[Math.PI / 2, 0, 0]}>
              {/* Outer Tire */}
              <mesh position={[0, -0.16, 0]} castShadow>
                <cylinderGeometry args={[0.42, 0.42, 0.22, 32]} />
                <meshStandardMaterial color={tireColor} roughness={0.85} />
              </mesh>
              {/* Outer Rim */}
              <mesh position={[0, -0.18, 0]}>
                <cylinderGeometry args={[0.25, 0.25, 0.225, 24]} />
                <meshStandardMaterial color={rimColor} metalness={0.8} roughness={0.2} />
              </mesh>

              {/* Inner Tire */}
              <mesh position={[0, 0.1, 0]} castShadow>
                <cylinderGeometry args={[0.42, 0.42, 0.22, 32]} />
                <meshStandardMaterial color={tireColor} roughness={0.85} />
              </mesh>
            </group>

            {/* Mudguard Arch above wheels */}
            <mesh position={[0, 0.44, widthM / 2 + 0.1]}>
              <boxGeometry args={[0.95, 0.03, 0.48]} />
              <meshStandardMaterial color="#1e293b" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.44, -widthM / 2 - 0.1]}>
              <boxGeometry args={[0.95, 0.03, 0.48]} />
              <meshStandardMaterial color="#1e293b" roughness={0.6} />
            </mesh>
          </group>
        );
      })}

      {/* ─────────────────────────────────────────────────────────────
          4. MODERN SEMI-TRUCK DRIVER CABIN (TRACTOR)
      ───────────────────────────────────────────────────────────── */}
      <group position={[-lengthM / 2 - cabLengthM / 2 - 0.1, cabHeightM / 2 - 0.12, 0]}>
        {/* Main Cab Body Shell (Beveled) */}
        <RoundedBox
          args={[cabLengthM, cabHeightM, cabWidthM]}
          radius={0.06}
          smoothness={4}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={cabBodyColor}
            roughness={0.4}
            metalness={0.35}
          />
        </RoundedBox>

        {/* Front Radiator Grille (Textured Horizontal Vents) */}
        <group position={[-cabLengthM / 2 - 0.015, -cabHeightM * 0.15, 0]}>
          <mesh>
            <boxGeometry args={[0.02, cabHeightM * 0.45, cabWidthM * 0.75]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          {[-0.15, -0.05, 0.05, 0.15].map((yOff, i) => (
            <mesh key={i} position={[-0.012, yOff * cabHeightM * 0.7, 0]}>
              <boxGeometry args={[0.01, 0.025, cabWidthM * 0.7]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.8} />
            </mesh>
          ))}
        </group>

        {/* Front Heavy Bumper & LED Headlights */}
        <group position={[-cabLengthM / 2 - 0.04, -cabHeightM / 2 + 0.22, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.1, 0.32, cabWidthM * 1.02]} />
            <meshStandardMaterial color={chassisColor} metalness={0.5} />
          </mesh>
          {/* Twin Headlights */}
          <mesh position={[-0.055, 0.02, cabWidthM * 0.38]}>
            <boxGeometry args={[0.015, 0.12, 0.2]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[-0.055, 0.02, -cabWidthM * 0.38]}>
            <boxGeometry args={[0.015, 0.12, 0.2]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
          </mesh>
        </group>

        {/* Tinted Front Windshield */}
        <mesh position={[-cabLengthM / 2 - 0.01, cabHeightM * 0.22, 0]}>
          <boxGeometry args={[0.02, cabHeightM * 0.38, cabWidthM * 0.86]} />
          <meshStandardMaterial
            color={glassColor}
            transparent
            opacity={0.65}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>

        {/* Side Windows (Left & Right) */}
        <mesh position={[-cabLengthM * 0.08, cabHeightM * 0.22, cabWidthM / 2 + 0.01]}>
          <boxGeometry args={[cabLengthM * 0.55, cabHeightM * 0.34, 0.02]} />
          <meshStandardMaterial color={glassColor} transparent opacity={0.65} roughness={0.1} />
        </mesh>
        <mesh position={[-cabLengthM * 0.08, cabHeightM * 0.22, -cabWidthM / 2 - 0.01]}>
          <boxGeometry args={[cabLengthM * 0.55, cabHeightM * 0.34, 0.02]} />
          <meshStandardMaterial color={glassColor} transparent opacity={0.65} roughness={0.1} />
        </mesh>

        {/* Left & Right Side Mirrors */}
        <group position={[-cabLengthM * 0.38, cabHeightM * 0.22, cabWidthM / 2 + 0.18]}>
          <mesh>
            <boxGeometry args={[0.08, 0.28, 0.06]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0.04, 0, 0]}>
            <boxGeometry args={[0.005, 0.25, 0.05]} />
            <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.05} />
          </mesh>
        </group>
        <group position={[-cabLengthM * 0.38, cabHeightM * 0.22, -cabWidthM / 2 - 0.18]}>
          <mesh>
            <boxGeometry args={[0.08, 0.28, 0.06]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0.04, 0, 0]}>
            <boxGeometry args={[0.005, 0.25, 0.05]} />
            <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.05} />
          </mesh>
        </group>

        {/* Vertical Exhaust Snorkel Pipe behind Cab */}
        <mesh position={[cabLengthM / 2 - 0.1, cabHeightM * 0.35, widthM * 0.38]}>
          <cylinderGeometry args={[0.07, 0.07, cabHeightM * 0.9, 16]} />
          <meshStandardMaterial color={metallicTankColor} metalness={0.9} roughness={0.15} />
        </mesh>
      </group>

      {/* ─────────────────────────────────────────────────────────────
          5. CONTAINER ENVELOPE / CAGE WIREFRAME
      ───────────────────────────────────────────────────────────── */}
      {showWalls && (
        <group>
          {/* Subtle container enclosure */}
          <mesh position={[0, heightM / 2, 0]}>
            <boxGeometry args={[lengthM, heightM, widthM]} />
            <meshStandardMaterial
              color={cageColor}
              transparent
              opacity={isDark ? 0.04 : 0.025}
              roughness={0.1}
              metalness={0.1}
              depthWrite={false}
            />
          </mesh>

          {/* Roof Edge Ribs / Bounding Wireframe */}
          <Line
            points={[
              [-lengthM / 2, heightM, -widthM / 2],
              [lengthM / 2, heightM, -widthM / 2],
              [lengthM / 2, heightM, widthM / 2],
              [-lengthM / 2, heightM, widthM / 2],
              [-lengthM / 2, heightM, -widthM / 2],
            ]}
            color={cageColor}
            lineWidth={1.5}
          />
          <Line
            points={[
              [-lengthM / 2, 0, -widthM / 2],
              [-lengthM / 2, heightM, -widthM / 2],
            ]}
            color={cageColor}
            lineWidth={1.5}
          />
          <Line
            points={[
              [-lengthM / 2, 0, widthM / 2],
              [-lengthM / 2, heightM, widthM / 2],
            ]}
            color={cageColor}
            lineWidth={1.5}
          />
          <Line
            points={[
              [lengthM / 2, 0, -widthM / 2],
              [lengthM / 2, heightM, -widthM / 2],
            ]}
            color={cageColor}
            lineWidth={1.5}
          />
          <Line
            points={[
              [lengthM / 2, 0, widthM / 2],
              [lengthM / 2, heightM, widthM / 2],
            ]}
            color={cageColor}
            lineWidth={1.5}
          />
        </group>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. ARCHITECTURAL DIMENSION CALLOUTS
      ───────────────────────────────────────────────────────────── */}
      <Text
        position={[0, -0.22, widthM / 2 + 0.45]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.2}
        color={textColor}
        anchorX="center"
        anchorY="middle"
      >
        {`LENGTH: ${(vehicle.length / 1000).toFixed(2)}m (${vehicle.length}mm)`}
      </Text>

      <Text
        position={[lengthM / 2 + 0.45, -0.22, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        fontSize={0.2}
        color={textColor}
        anchorX="center"
        anchorY="middle"
      >
        {`WIDTH: ${(vehicle.width / 1000).toFixed(2)}m (${vehicle.width}mm)`}
      </Text>

      <Text
        position={[lengthM / 2, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        fontSize={0.18}
        color={textColor}
        anchorX="center"
        anchorY="middle"
      >
        ▼ REAR TAILGATE ▼
      </Text>
    </group>
  );
};
