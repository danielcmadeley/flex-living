import { NextRequest, NextResponse } from "next/server";
import HostawayService from "@/lib/services/hostaway";
import {
  normalizeHostawayReviews,
  sortReviewsByDate,
  groupReviewsByListing,
  groupReviewsByType,
  calculateAverageRatings,
} from "@/lib/utils/reviewNormalizer";
import {
  ReviewsApiResponse,
  NormalizedReview,
  HostawayReviewsResponse,
} from "@/lib/types/hostaway";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const listingId = searchParams.get("listingId");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    const groupBy = searchParams.get("groupBy"); // 'listing', 'type', or null

    // Note: listingId, type, status, limit, offset are extracted for future API implementation
    // Currently using mock data, but these params are ready for real Hostaway API integration
    const sortOrder =
      (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
    const includeStats = searchParams.get("includeStats") === "true";

    // Get Hostaway service instance
    const hostawayService = HostawayService.getInstance();

    // Fetch reviews from Hostaway API
    const hostawayResponse = (await hostawayService.getReviews({
      listingId: listingId ? parseInt(listingId) : undefined,
      type: type || undefined,
      status: status || undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    })) as HostawayReviewsResponse;

    if (hostawayResponse.status !== "success") {
      return NextResponse.json(
        {
          status: "error",
          data: [],
          total: 0,
          message: "Failed to fetch reviews from Hostaway",
        } as ReviewsApiResponse,
        { status: 500 },
      );
    }

    // Normalize the reviews
    let normalizedReviews = normalizeHostawayReviews(hostawayResponse.result);

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
