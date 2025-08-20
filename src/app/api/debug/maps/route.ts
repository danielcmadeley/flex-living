import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      status: "error",
      message: "Google Maps API key not configured",
      details: {
        hasKey: false,
        keyConfigured: false,
      }
    }, { status: 500 });
  }

  const results: Record<string, any> = {
    status: "checking",
    apiKey: {
      exists: true,
      masked: `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`,
    },
    apis: {},
  };

  // Test Maps JavaScript API by checking if we can geocode
  try {
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=London,UK&key=${apiKey}`;
    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();

    results.apis.geocoding = {
      enabled: geocodeData.status === "OK",
      status: geocodeData.status,
      error: geocodeData.error_message || null,
    };
  } catch (error) {
    results.apis.geocoding = {
      enabled: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // Test Places API
  try {
    const placeId = "ChIJdd4hrwug2EcRmSrV3Vo6llI"; // London
    const placeUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating&key=${apiKey}`;
    const placeResponse = await fetch(placeUrl);
    const placeData = await placeResponse.json();

    results.apis.places = {
      enabled: placeData.status === "OK",
      status: placeData.status,
      error: placeData.error_message || null,
    };
  } catch (error) {
    results.apis.places = {
      enabled: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // Check for common API key issues
  const issues: string[] = [];

  if (results.apis.geocoding?.status === "REQUEST_DENIED") {
    issues.push("Geocoding API is not enabled for this API key");
  }

  if (results.apis.places?.status === "REQUEST_DENIED") {
    issues.push("Places API is not enabled for this API key");
  }

  if (results.apis.geocoding?.status === "OVER_QUERY_LIMIT") {
    issues.push("API key has exceeded its quota");
  }

  if (!results.apis.geocoding?.enabled && !results.apis.places?.enabled) {
    issues.push("No Google Maps APIs are working. Please check your API key configuration");
  }

  // Determine overall status
  const allApisWorking = Object.values(results.apis).every((api: any) => api.enabled);
  const someApisWorking = Object.values(results.apis).some((api: any) => api.enabled);

  results.status = allApisWorking ? "success" : someApisWorking ? "partial" : "error";
  results.issues = issues;
  results.recommendations = [];

  if (!allApisWorking) {
    results.recommendations.push("Go to https://console.cloud.google.com/");
    results.recommendations.push("Enable the following APIs: Maps JavaScript API, Places API, Geocoding API");
    results.recommendations.push("Check that your API key has no restrictions or includes your domain");
  }

  return NextResponse.json(results, {
    status: results.status === "error" ? 500 : 200,
  });
}
