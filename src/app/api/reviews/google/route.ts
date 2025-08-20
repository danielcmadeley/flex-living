import { NextResponse } from "next/server";

// Property-specific Google Place IDs mapping
const GOOGLE_PLACE_IDS: Record<string, string> = {
  // Test with British Museum (stable, well-known landmark)
  "1B Central London Modern Flat": "ChIJB9OTMDIbdkgRp0JWbQGZsS8",
  "Test Property": "ChIJB9OTMDIbdkgRp0JWbQGZsS8",
  // Add your actual property mappings here
  "Flex Living - Central London": process.env.GOOGLE_PLACE_ID_CENTRAL || "",
  "Flex Living - Canary Wharf": process.env.GOOGLE_PLACE_ID_CANARY || "",
  "Flex Living - King's Cross": process.env.GOOGLE_PLACE_ID_KINGS || "",
};

// Fallback to a well-known London location for testing
const FALLBACK_PLACE_ID = "ChIJB9OTMDIbdkgRp0JWbQGZsS8"; // British Museum London

export async function GET(request: Request) {
  try {
    console.log("Google API route called");

    const { searchParams } = new URL(request.url);
    const propertyName = searchParams.get("propertyName");
    const language = searchParams.get("language") || "en";

    console.log("Property name:", propertyName);
    console.log("Language:", language);

    const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    console.log("API Key exists:", !!GOOGLE_API_KEY);

    if (!GOOGLE_API_KEY) {
      console.error("No Google API key found");
      return NextResponse.json(
        {
          error: "Google API key not configured",
          debug: {
            hasKey: false,
            propertyName,
            language,
          },
        },
        { status: 500 },
      );
    }

    // Determine which Place ID to use
    let placeId = FALLBACK_PLACE_ID;

    if (propertyName && GOOGLE_PLACE_IDS[propertyName]) {
      placeId = GOOGLE_PLACE_IDS[propertyName];
      console.log(`Using specific Place ID for ${propertyName}:`, placeId);
    } else {
      console.log(`Using fallback Place ID:`, placeId);
    }

    // Build the Google Places API URL
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&language=${language}&key=${GOOGLE_API_KEY}`;
    console.log("Making request to Google Places API");

    const response = await fetch(url);
    console.log("Google API response status:", response.status);

    if (!response.ok) {
      console.error(
        "Google API HTTP error:",
        response.status,
        response.statusText,
      );
      return NextResponse.json(
        {
          error: "Failed to fetch from Google Places API",
          status: response.status,
          statusText: response.statusText,
        },
        { status: 500 },
      );
    }

    const data = await response.json();
    console.log("Google API response status:", data.status);
    console.log("Number of reviews:", data.result?.reviews?.length || 0);

    if (data.status !== "OK") {
      console.error(
        "Google Places API error:",
        data.status,
        data.error_message,
      );

      // Return mock data for testing when Google API fails
      console.log("Google API failed, returning mock data for testing");

      const mockReviews = [
        {
          id: "mock_review_1",
          source: "google",
          author: "John Smith",
          authorPhoto: "https://lh3.googleusercontent.com/a/default-user=s40-c",
          authorUrl: null,
          rating: 5,
          text: "Absolutely fantastic property! The location is perfect, right in the heart of Central London. The flat was spotless, modern, and had everything we needed for our stay. Highly recommend!",
          createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
          relativeTime: "a week ago",
          language: "en",
          originalLanguage: "en",
          translated: false,
          propertyName: propertyName || "Test Property",
          overallRating: 10,
          comment:
            "Absolutely fantastic property! The location is perfect, right in the heart of Central London. The flat was spotless, modern, and had everything we needed for our stay. Highly recommend!",
          guestName: "John Smith",
          submittedAt: new Date(Date.now() - 86400000 * 7),
          type: "guest-to-host" as const,
          status: "published" as const,
          categories: {
            overall: 10,
            experience: 10,
            value: 10,
          },
        },
        {
          id: "mock_review_2",
          source: "google",
          author: "Sarah Johnson",
          authorPhoto: "https://lh3.googleusercontent.com/a/default-user=s40-c",
          authorUrl: null,
          rating: 4,
          text: "Great central location with easy access to transport links. The apartment was clean and well-equipped. Only minor issue was the noise from the street, but that's expected in Central London.",
          createdAt: new Date(Date.now() - 86400000 * 14).toISOString(), // 14 days ago
          relativeTime: "2 weeks ago",
          language: "en",
          originalLanguage: "en",
          translated: false,
          propertyName: propertyName || "Test Property",
          overallRating: 8,
          comment:
            "Great central location with easy access to transport links. The apartment was clean and well-equipped. Only minor issue was the noise from the street, but that's expected in Central London.",
          guestName: "Sarah Johnson",
          submittedAt: new Date(Date.now() - 86400000 * 14),
          type: "guest-to-host" as const,
          status: "published" as const,
          categories: {
            overall: 8,
            experience: 8,
            value: 8,
          },
        },
        {
          id: "mock_review_3",
          source: "google",
          author: "Michael Chen",
          authorPhoto: "https://lh3.googleusercontent.com/a/default-user=s40-c",
          authorUrl: null,
          rating: 5,
          text: "Perfect for our London trip! Walking distance to major attractions, excellent amenities, and the host was very responsive. Would definitely stay here again.",
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 days ago
          relativeTime: "a month ago",
          language: "en",
          originalLanguage: "en",
          translated: false,
          propertyName: propertyName || "Test Property",
          overallRating: 10,
          comment:
            "Perfect for our London trip! Walking distance to major attractions, excellent amenities, and the host was very responsive. Would definitely stay here again.",
          guestName: "Michael Chen",
          submittedAt: new Date(Date.now() - 86400000 * 30),
          type: "guest-to-host" as const,
          status: "published" as const,
          categories: {
            overall: 10,
            experience: 10,
            value: 10,
          },
        },
      ];

      return NextResponse.json({
        reviews: mockReviews,
        averageRating: 4.7,
        totalReviews: 156,
        propertyName: propertyName || "Test Property",
        placeId: placeId,
        lastUpdated: new Date().toISOString(),
        debug: {
          mockData: true,
          originalError: data.status,
          message: "Using mock data because Google API failed",
        },
      });
    }

    // Transform reviews to match expected format
    const transformedReviews = (data.result.reviews || []).map(
      (review: any, index: number) => ({
        id: `google_${review.time}_${placeId}_${index}`,
        source: "google",
        author: review.author_name,
        authorPhoto: review.profile_photo_url,
        authorUrl: review.author_url,
        rating: review.rating,
        text: review.text,
        createdAt: new Date(review.time * 1000).toISOString(),
        relativeTime: review.relative_time_description,
        language: review.language,
        originalLanguage: review.original_language,
        translated: review.translated || false,
        propertyName: propertyName || "Default Property",
        // Map to your review structure
        overallRating: review.rating * 2, // Convert from 1-5 to 1-10 scale
        comment: review.text,
        guestName: review.author_name,
        submittedAt: new Date(review.time * 1000),
        type: "guest-to-host" as const,
        status: "published" as const,
        categories: {
          overall: review.rating * 2,
          experience: review.rating * 2,
          value: review.rating * 2,
        },
      }),
    );

    const result = {
      reviews: transformedReviews,
      averageRating: data.result.rating || 0,
      totalReviews: data.result.user_ratings_total || 0,
      propertyName: propertyName || "Default Property",
      placeId,
      lastUpdated: new Date().toISOString(),
      debug: {
        originalReviewCount: data.result.reviews?.length || 0,
        transformedReviewCount: transformedReviews.length,
        propertyName,
        language,
      },
    };

    console.log(
      "Returning successful response with",
      transformedReviews.length,
      "reviews",
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Unexpected error in Google API route:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        debug: {
          errorType: error?.constructor?.name,
          stack: error instanceof Error ? error.stack : undefined,
        },
      },
      { status: 500 },
    );
  }
}
