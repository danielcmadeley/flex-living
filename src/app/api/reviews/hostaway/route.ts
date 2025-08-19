import { NextRequest, NextResponse } from "next/server";
import { ReviewsQueries } from "@/db/queries";
import {
  sortReviewsByDate,
  groupReviewsByListing,
  groupReviewsByType,
  calculateAverageRatings,
} from "@/lib/utils/reviewNormalizer";
import { NormalizedReview } from "@/lib/types/hostaway";
import { reviewQuerySchema, reviewsApiResponseSchema } from "@/lib/schemas";
import {
  validateQueryParams,
  createValidationErrorResponse,
} from "@/lib/utils/validation";

export async function GET(request: NextRequest) {
  try {
    // Validate query parameters
    const validation = validateQueryParams(reviewQuerySchema, request);

    if (!validation.success) {
      return createValidationErrorResponse(validation.error);
    }

    const {
      type,
      status,
      listingName,
      limit,
      sortOrder,
      includeStats,
      groupBy,
    } = validation.data;

    // Fetch reviews from database
    const dbReviews = await ReviewsQueries.getAll({
      type: type || undefined,
      status: status || undefined,
      listingName: listingName || undefined,
      limit: limit || undefined,
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

    const response = {
      status: "success" as const,
      data: responseData as NormalizedReview[],
      total: normalizedReviews.length,
      ...additionalInfo,
    };

    // Validate response before sending
    const responseValidation = reviewsApiResponseSchema.safeParse(response);

    if (!responseValidation.success) {
      console.error("Response validation failed:", responseValidation.error);
      return NextResponse.json(
        {
          status: "error",
          data: [],
          total: 0,
          message: "Response validation failed",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(responseValidation.data, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
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
      },
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
