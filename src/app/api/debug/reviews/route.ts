import { NextRequest, NextResponse } from "next/server";
import { ReviewsQueries } from "@/db/queries";

export async function GET(request: NextRequest) {
  try {
    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'check';

    if (action === 'seed') {
      // Force seed the database
      console.log("🌱 Force seeding database...");
      const seededReviews = await ReviewsQueries.forceReseed();

      return NextResponse.json({
        status: "success",
        message: `Force seeded ${seededReviews.length} reviews`,
        data: seededReviews.slice(0, 5) // Show first 5 for brevity
      });
    }

    if (action === 'clear') {
      // Clear all reviews
      console.log("🗑️ Clearing all reviews...");
      await ReviewsQueries.clearAllReviews();

      return NextResponse.json({
        status: "success",
        message: "All reviews cleared"
      });
    }

    // Default action: check database contents
    const allReviews = await ReviewsQueries.getAll();
    const publishedReviews = await ReviewsQueries.getAll({ status: 'published' });
    const totalCount = await ReviewsQueries.count();

    // Get listing breakdown
    const listingBreakdown = allReviews.reduce((acc, review) => {
      const listing = review.listingName;
      if (!acc[listing]) {
        acc[listing] = { total: 0, published: 0, pending: 0, draft: 0 };
      }
      acc[listing].total++;
      acc[listing][review.status as keyof typeof acc[typeof listing]]++;
      return acc;
    }, {} as Record<string, { total: number; published: number; pending: number; draft: number }>);

    // Get specific property data
    const shoreditchProperty = "2B N1 A - 29 Shoreditch Heights";
    const shoreditchReviews = await ReviewsQueries.getAll({
      listingName: shoreditchProperty,
      status: 'published'
    });

    // Check for exact match
    const exactMatch = allReviews.filter(r => r.listingName === shoreditchProperty);
    const partialMatch = allReviews.filter(r => r.listingName.includes("Shoreditch"));

    return NextResponse.json({
      status: "success",
      debug: {
        totalReviews: totalCount,
        allReviewsLength: allReviews.length,
        publishedReviewsLength: publishedReviews.length,
        listingBreakdown,
        shoreditchData: {
          exactPropertyName: shoreditchProperty,
          exactMatches: exactMatch.length,
          exactMatchReviews: exactMatch.map(r => ({
            id: r.id,
            status: r.status,
            listingName: r.listingName,
            guestName: r.guestName
          })),
          partialMatches: partialMatch.length,
          partialMatchReviews: partialMatch.map(r => ({
            id: r.id,
            status: r.status,
            listingName: r.listingName
          })),
          publishedShoreditchReviews: shoreditchReviews.length
        },
        sampleReviews: allReviews.slice(0, 3).map(r => ({
          id: r.id,
          status: r.status,
          listingName: r.listingName,
          guestName: r.guestName,
          rating: r.rating,
          reviewCategoryType: typeof r.reviewCategory,
          reviewCategoryLength: Array.isArray(r.reviewCategory) ? r.reviewCategory.length : 'not array'
        })),
        uniqueListingNames: [...new Set(allReviews.map(r => r.listingName))].sort()
      }
    });

  } catch (error) {
    console.error("Debug API error:", error);

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
