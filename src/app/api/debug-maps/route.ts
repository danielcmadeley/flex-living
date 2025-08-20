import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testPlaceId =
      searchParams.get("placeId") || "ChIJdd4hrwug2EcRmSrV3Vo6llI";

    // Check environment variables
    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    const debugInfo: {
      timestamp: string;
      apiKey: { present: boolean; length?: number; prefix?: string };
      testPlaceId: string;
      environment: string | undefined;
      placesApiTest?: {
        status?: string;
        result?: {
          name?: string;
          formatted_address?: string;
          geometry?: { lat: number; lng: number } | null;
        } | null;
        error?: string | null;
      };
    } = {
      timestamp: new Date().toISOString(),
      apiKey: googleApiKey
        ? {
            present: true,
            length: googleApiKey.length,
            prefix: googleApiKey.substring(0, 8) + "...",
          }
        : {
            present: false,
          },
      testPlaceId,
      environment: process.env.NODE_ENV,
    };

    // Test the Places API directly
    if (googleApiKey) {
      try {
        const placesApiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${testPlaceId}&fields=geometry,formatted_address,name&key=${googleApiKey}`;

        const response = await fetch(placesApiUrl);
        const data = await response.json();

        debugInfo.placesApiTest = {
          status: data.status,
          result: data.result
            ? {
                name: data.result.name,
                formatted_address: data.result.formatted_address,
                geometry: data.result.geometry
                  ? {
                      lat: data.result.geometry.location.lat,
                      lng: data.result.geometry.location.lng,
                    }
                  : null,
              }
            : null,
          error: data.error_message || null,
        };
      } catch (apiError) {
        debugInfo.placesApiTest = {
          error:
            apiError instanceof Error ? apiError.message : "Unknown API error",
        };
      }
    }

    return NextResponse.json({
      success: true,
      debug: debugInfo,
    });
  } catch (error) {
    console.error("Debug Maps API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
