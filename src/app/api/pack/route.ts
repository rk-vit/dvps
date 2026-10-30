import { NextRequest, NextResponse } from 'next/server';
import { solve3DPacking } from '@/lib/engine/solver';
import { CargoItem, VehicleContainer } from '@/lib/types/packing';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vehicle, items } = body as {
      vehicle?: VehicleContainer;
      items?: CargoItem[];
    };

    // Validation: Vehicle check
    if (!vehicle || !vehicle.length || !vehicle.width || !vehicle.height || !vehicle.maxPayloadKg) {
      return NextResponse.json(
        {
          error: 'Invalid vehicle definition. Required properties: length, width, height, maxPayloadKg',
        },
        { status: 400 }
      );
    }

    // Validation: Items check
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          error: 'No cargo items provided to pack.',
        },
        { status: 400 }
      );
    }

    // Run the 3D packing heuristic optimization engine
    const result = solve3DPacking(vehicle, items);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Packing engine API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process packing request',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
