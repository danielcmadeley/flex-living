import { NextRequest, NextResponse } from "next/server";
import { ReviewsQueries } from "@/db/queries";
import {
  sortReviewsByDate,
  groupReviewsByListing,
  groupReviewsByType,
  calculateAverageRatings,
} from "@/lib/utils/reviewNormalizer";
import { ReviewsApiResponse, NormalizedReview } from "@/lib/types/hostaway";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");
    const groupBy = searchParams.get("groupBy"); // 'listing', 'type', or null

    // Note: These params are ready for real Hostaway API integration
    const sortOrder =
      (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
    const includeStats = searchParams.get("includeStats") === "true";

    // Fetch reviews from database
    const dbReviews = await ReviewsQueries.getAll({
      type: type || undefined,
      status: status || undefined,
      listingName: searchParams.get("listingName") || undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    // Convert database reviews to normalized format
    let normalizedReviews: NormalizedReview[] = dbReviews.map((review) => ({
      id: review.id,
      type: review.type as "host-to-guest" | "guest-to-host",
      status: review.status as "published" | "pending" | "draft",
      overallRating: review.rating,
      comment: review.publicReview,
      categories: review.reviewCategory.reduce(
        (acc, cat) => {
          acc[cat.category as keyof typeof acc] = cat.rating;
          return acc;
        },
        {} as Record<string, number>,
      ),
      submittedAt: review.submittedAt,
      guestName: review.guestName,
      listingName: review.listingName,
      channel: "database",
    }));

    // Sort reviews by date
    normalizedReviews = sortReviewsByDate(normalizedReviews, sortOrder);

    // Prepare response data
    let responseData: unknown = normalizedReviews;
    const additionalInfo: Record<string, unknown> = {};

    // Group reviews if requested
    if (groupBy === "listing") {
      responseData = groupReviewsByListing(normalizedReviews);
      additionalInfo.groupedBy = "listing";
    } else if (groupBy === "type") {
      responseData = groupReviewsByType(normalizedReviews);
      additionalInfo.groupedBy = "type";
    }

    // Include statistics if requested
    if (includeStats) {
      const stats = calculateAverageRatings(normalizedReviews);
      additionalInfo.statistics = {
        ...stats,
        totalReviews: normalizedReviews.length,
        reviewTypes: {
          "host-to-guest": normalizedReviews.filter(
            (r) => r.type === "host-to-guest",
          ).length,
          "guest-to-host": normalizedReviews.filter(
            (r) => r.type === "guest-to-host",
          ).length,
        },
      };
    }

    const response: ReviewsApiResponse & Record<string, unknown> = {
      status: "success",
      data: responseData as NormalizedReview[],
      total: normalizedReviews.length,
      ...additionalInfo,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching Hostaway reviews:", error);

    return NextResponse.json(
      {
        status: "error",
        data: [],
        total: 0,
        message:
          error instanceof Error ? error.message : "Internal server error",
      } as ReviewsApiResponse,
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
