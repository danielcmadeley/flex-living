import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug') || '2b-n1-a-29-shoreditch-heights';

    // Convert slug back to listing name with special case mappings
    const slugToListingName = (slug: string) => {
      // Known mappings for problematic conversions
      const slugMappings: Record<string, string> = {
        "2b-n1-a-29-shoreditch-heights": "2B N1 A - 29 Shoreditch Heights",
        "1b-central-london-modern-flat": "1B Central London - Modern Flat",
      };

      // Check for exact mapping first
      if (slugMappings[slug.toLowerCase()]) {
        return slugMappings[slug.toLowerCase()];
      }

      // Default conversion for other cases
      return slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    const listingName = slugToListingName(slug);

    // Test the API call that the listing page would make
    const apiUrl = `${request.nextUrl.origin}/api/reviews/hostaway?status=published&listingName=${encodeURIComponent(listingName)}&includeStats=true`;

    const response = await fetch(apiUrl);
    const reviewData = await response.json();

    return NextResponse.json({
      status: "success",
      test: {
        inputSlug: slug,
        convertedListingName: listingName,
        encodedForApi: encodeURIComponent(listingName),
        apiUrl,
        reviewsFound: reviewData.total || 0,
        reviewData: reviewData.status === "success" ? {
          total: reviewData.total,
          hasStatistics: !!reviewData.statistics,
          overallRating: reviewData.statistics?.overall || 0
        } : reviewData
      }
    });

  } catch (error) {
    console.error("Slug test error:", error);

    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
      error: {
        name: error instanceof Error ? error.name : "Unknown",
        stack: error instanceof Error ? error.stack : "No stack trace"
      }
    }, { status: 500 });
  }
}
