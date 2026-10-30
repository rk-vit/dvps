# Spearhead 3D Dispatch Vehicle Planner & Packing System

An industrial-grade 3D Container Loading Problem (3D-CLP) solver and interactive simulation system designed for manufacturing and structural dispatch operations.

Built with **Next.js 15 (App Router)**, **TypeScript**, **React Three Fiber (Three.js)**, and **Tailwind CSS**.

---

## 🚀 Key Features

1. **Preset Fleet & Custom Dimensional Vehicles:**
   - Pre-configured catalog: 14ft Canter, 20ft Container, 24ft Hauler, 40ft High Cube Container, 40ft Flatbed Trailer.
   - Interactive **Custom Dimensions Mode**: set exact Length, Width, Height, and Max Payload capacity in millimeters and kilograms.

2. **Industrial-Grade 3D Packing Heuristic Engine (`src/lib/engine`):**
   - **Extreme Points (EP) Heuristic:** Generates optimal 3D anchor points for dense cubic packing.
   - **Multi-Criteria Best-Fit Decreasing:** Heavy, structural foundation pieces are placed first.
   - **Physical Gravity & Base Support:** Checks that elevated items are at least 70% supported by items beneath them (no floating structures).
   - **Stackability & Bearing Load:** Respects fragile flags and `maxWeightOnTopKg` load thresholds.
   - **Orientation Constraints:** Handles `any`, `upright_only`, `flat_only`, `lengthwise`, and `locked` rotations.
   - **Center of Gravity (CoG) & Axle Balancing:** Calculates longitudinal (front/rear axle %) and lateral stability with real-time imbalance warnings.

3. **Interactive 3D Simulation & Playback (`src/components/3d`):**
   - High-fidelity Three.js scene showing the truck cab, wheels, wireframe enclosure, and edge-labeled cargo boxes.
   - **Step-by-Step Loading Timeline:** Scrub back and forth or hit **Play** to watch the truck load item-by-item in sequence (Front $\to$ Rear, Bottom $\to$ Top).
   - **Camera Presets:** One-click toggles for Orbit, Top View (plan view), Side Profile, and Rear Doors view.
   - **X-Ray / Height Cutaway Slider:** Slice through horizontal layers to inspect deep interior placements.
   - **Visual Center of Gravity Marker:** Glowing 3D target and vertical beam directly on the truck bed.

4. **REST API & Future Persistence (`/api/pack`):**
   - Decoupled server-side API route for headless integration with ERPs, WMS systems, or external scripts.
   - Ready for database persistence (saving plans) and headless PDF generation.

5. **Printable Dispatch Manifest:**
   - Step-by-step checklist formatted for warehouse loaders and forklift drivers with coordinates, dimensions, weight, and sign-off blocks.

---

## 📂 Project Architecture & Directory Structure

```
spearhead-dispatch-vehicle-planner/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── pack/
│   │   │       └── route.ts         # REST API endpoint for 3D packing calculations
│   │   ├── globals.css              # Custom styling & print styles
│   │   ├── layout.tsx               # Root layout & metadata
│   │   └── page.tsx                 # Main Dispatch Planner Dashboard
│   ├── components/
│   │   ├── 3d/
│   │   │   ├── LoadingScene3D.tsx   # Three.js canvas & camera controller
│   │   │   ├── VehicleBedMesh.tsx   # 3D truck chassis, cab, wheels, and wireframe enclosure
│   │   │   ├── PlacedCargoMesh.tsx  # 3D cargo meshes with outlines, step numbers, and hover inspector
│   │   │   ├── CenterOfGravityMarker.tsx # Visual CoG floor reticle and vertical elevation beam
│   │   │   └── ViewControls.tsx     # Camera angle presets (Top, Side, Rear, Orbit) & cutaway slider
│   │   └── ui/
│   │       ├── VehicleSelector.tsx  # Fleet presets and custom dimension inputs
│   │       ├── CargoCatalog.tsx     # Items table, quantity steppers, add item modal, and sample presets
│   │       ├── TimelineSlider.tsx   # Scrubbable loading timeline with Play/Pause and speed toggles
│   │       ├── MetricsDashboard.tsx # Volume %, Payload weight %, Axle balance %, and unplaced alerts
│   │       └── ManifestDrawer.tsx   # Printable dispatch manifest and step-by-step instructions
│   └── lib/
│       ├── types/
│       │   └── packing.ts           # Domain models: Vehicle, CargoItem, PlacedItem, PackingResult
│       ├── engine/
│       │   ├── orientations.ts      # 3D rotation permutations and orientation constraints
│       │   ├── geometry.ts          # 3D AABB collision detection, boundary checks, and 2D footprint overlaps
│       │   ├── physics.ts           # Gravity support validation, stack weight limits, CoG & axle balance
│       │   ├── extremePoints.ts     # Extreme Points generation, deduplication, and projection
│       │   ├── solver.ts            # Master 3D Packing Optimization Engine
│       │   ├── presets.ts           # Standard commercial vehicles & sample manufactured structures
│       │   └── test-run.ts          # Automated verification script
│       └── store/
│           └── usePlannerStore.ts   # Reactive Zustand state store coordinating UI, 3D scene, and solver
```

---

## 💻 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Automated Engine Verifications
```bash
npm run test:engine
```
Tests boundary containment, collision-free packing, gravity support, stack load bearing, and execution speed.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 📡 Using the REST API (`/api/pack`)

You can invoke the packing engine programmatically:

### Request: `POST /api/pack`
```json
{
  "vehicle": {
    "id": "truck-24ft",
    "name": "24ft Hauler",
    "length": 7300,
    "width": 2400,
    "height": 2450,
    "maxPayloadKg": 14000,
    "isEnclosed": true
  },
  "items": [
    {
      "id": "item-1",
      "name": "Precast Concrete Beam",
      "length": 2500,
      "width": 800,
      "height": 600,
      "weight": 850,
      "quantity": 4,
      "orientation": "lengthwise",
      "allowStackAbove": true,
      "maxWeightOnTopKg": 2500,
      "requiredMinSupportPercent": 75,
      "color": "#3b82f6"
    }
  ]
}
```

### Response: `200 OK`
```json
{
  "success": true,
  "result": {
    "placedItems": [ ... ],
    "unplacedItems": [ ... ],
    "volumeUtilizationPercent": 48.2,
    "weightUtilizationPercent": 24.3,
    "centerOfGravity": {
      "x": 2450,
      "y": 1200,
      "z": 300,
      "frontAxleRatio": 0.66,
      "rearAxleRatio": 0.34
    },
    "calculationTimeMs": 3
  }
}
```

---

## 🔮 Extending the Application (Next Steps)
- **Persisting Plans:** Create a `/api/plans` route connected to Prisma or Supabase to save and load plans by ID or Order Number.
- **Server PDF Generation:** Generate downloadable PDFs server-side using `@react-pdf/renderer` or Chromium Puppeteer.
- **ERP / WMS Integration:** Fetch work orders directly from SAP, Oracle, or custom manufacturing ERPs using the `/api/pack` endpoint.
