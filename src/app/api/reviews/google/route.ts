import { NextResponse } from "next/server";
import { logger } from "@/lib/utils/logger";
import { API, ERROR_MESSAGES } from "@/lib/constants";

// ============================================================================
// Types
// ============================================================================
interface GoogleReview {
  author_name: string;
  author_url?: string;
  language: string;
  original_language?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
  translated?: boolean;
}

interface GooglePlacesResponse {
  status: string;
  result?: {
    reviews?: GoogleReview[];
    rating?: number;
    user_ratings_total?: number;
  };
  error_message?: string;
}

interface TransformedReview {
  id: string;
  author: string;
  authorUrl?: string;
  rating: number;
  text: string;
  time: number;
  relativeTime: string;
  language: string;
}

// ============================================================================
// Configuration
// ============================================================================
const GOOGLE_PLACE_IDS: Record<string, string> = {
  // Map property names to Google Place IDs
  "1B Central London Modern Flat": "ChIJB9OTMDIbdkgRp0JWbQGZsS8",
  "Flex Living - Central London": process.env.GOOGLE_PLACE_ID_CENTRAL || "",
  "Flex Living - Canary Wharf": process.env.GOOGLE_PLACE_ID_CANARY || "",
  "Flex Living - King's Cross": process.env.GOOGLE_PLACE_ID_KINGS || "",
};

// Fallback to British Museum for testing
const FALLBACK_PLACE_ID = "ChIJB9OTMDIbdkgRp0JWbQGZsS8";

const GOOGLE_PLACES_API_BASE =
  "https://maps.googleapis.com/maps/api/place/details/json";
const REQUIRED_FIELDS = "reviews,rating,user_ratings_total";

// ============================================================================
// Helper Functions
// ============================================================================
const getPlaceId = (propertyName: string | null): string => {
  if (propertyName && GOOGLE_PLACE_IDS[propertyName]) {
    return GOOGLE_PLACE_IDS[propertyName];
  }
  return FALLBACK_PLACE_ID;
};

const buildGoogleApiUrl = (
  placeId: string,
  apiKey: string,
  language: string = "en",
): string => {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: REQUIRED_FIELDS,
    language,
    key: apiKey,
  });
  return `${GOOGLE_PLACES_API_BASE}?${params.toString()}`;
};

const transformGoogleReview = (
  review: GoogleReview,
  index: number,
): TransformedReview => ({
  id: `google-${review.time}-${index}`,
  author: review.author_name,
  authorUrl: review.author_url,
  rating: review.rating,
  text: review.text,
  time: review.time,
  relativeTime: review.relative_time_description,
  language: review.language,
});

const createMockReviews = (): TransformedReview[] => [
  {
    id: "mock-1",
    author: "John Smith",
    rating: 5,
    text: "Excellent location in the heart of London. Clean, modern, and well-maintained property.",
    time: Date.now() / 1000 - 86400 * 7,
    relativeTime: "a week ago",
    language: "en",
  },
  {
    id: "mock-2",
    author: "Emma Johnson",
    rating: 4,
    text: "Great stay overall. Very convenient location and responsive host. Would recommend.",
    time: Date.now() / 1000 - 86400 * 14,
    relativeTime: "2 weeks ago",
    language: "en",
  },
  {
    id: "mock-3",
    author: "David Chen",
    rating: 5,
    text: "Perfect for business travel. Fast wifi, comfortable bed, and walking distance to transport.",
    time: Date.now() / 1000 - 86400 * 30,
    relativeTime: "a month ago",
    language: "en",
  },
];

// ============================================================================
// API Route Handler
// ============================================================================
export async function GET(request: Request) {
  const apiLogger = logger.child("google-reviews-api");

  try {
    const { searchParams } = new URL(request.url);
    const propertyName = searchParams.get("propertyName");
    const language = searchParams.get("language") || "en";

    apiLogger.info("Google reviews request received", {
      propertyName,
      language,
    });

    // Check for API key
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      apiLogger.error("Google API key not configured");
      return NextResponse.json(
        {
          error: "Google API key not configured",
          reviews: [],
          fallback: true,
        },
        { status: 500 },
      );
    }

    // Get the appropriate Place ID
    const placeId = getPlaceId(propertyName);
    apiLogger.debug("Using Place ID", { placeId, propertyName });

    // Make request to Google Places API
    const url = buildGoogleApiUrl(placeId, apiKey, language);
    const response = await fetch(url, {
      signal: AbortSignal.timeout(API.TIMEOUT),
    });

    if (!response.ok) {
      apiLogger.error("Google API HTTP error", {
        status: response.status,
        statusText: response.statusText,
      });

      // Return mock data on API failure
      return NextResponse.json({
        reviews: createMockReviews(),
        rating: 4.5,
        totalReviews: 3,
        source: "mock",
        message: "Using sample data due to API unavailability",
      });
    }

    const data: GooglePlacesResponse = await response.json();

    if (data.status !== "OK") {
      apiLogger.warn("Google Places API returned non-OK status", {
        status: data.status,
        error: data.error_message,
      });

      // Return mock data for non-OK status
      return NextResponse.json({
        reviews: createMockReviews(),
        rating: 4.5,
        totalReviews: 3,
        source: "mock",
        message: "Using sample data",
      });
    }

    // Transform the reviews
    const reviews = data.result?.reviews || [];
    const transformedReviews = reviews.map(transformGoogleReview);

    apiLogger.info("Successfully fetched Google reviews", {
      count: transformedReviews.length,
      rating: data.result?.rating,
    });

    return NextResponse.json({
      reviews: transformedReviews,
      rating: data.result?.rating || 0,
      totalReviews: data.result?.user_ratings_total || 0,
      source: "google",
    });
  } catch (error) {
    apiLogger.error("Failed to fetch Google reviews", error);

    // Return a graceful fallback response
    return NextResponse.json({
      reviews: [],
      rating: 0,
      totalReviews: 0,
      source: "error",
      error: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
}
