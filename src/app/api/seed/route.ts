import { NextRequest, NextResponse } from "next/server";
import { ReviewsQueries } from "@/db/queries";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "seed";

    let result;
    let message;

    switch (action) {
      case "seed":
        // Regular seed (checks for existing data)
        result = await ReviewsQueries.seedMockData();
        message = result.length > 0
          ? `Seeded ${result.length} reviews`
          : "No seeding needed - data already exists";
        break;

      case "force":
        // Force seed (ignores existing data)
        result = await ReviewsQueries.forceSeedMockData();
        message = `Force seeded ${result.length} reviews`;
        break;

      case "reseed":
        // Clear and reseed
        result = await ReviewsQueries.forceReseed();
        message = `Cleared and reseeded ${result.length} reviews`;
        break;

      case "clear":
        // Clear all data
        const cleared = await ReviewsQueries.clearAllReviews();
        return NextResponse.json({
          success: cleared,
          message: cleared ? "All reviews cleared" : "Failed to clear reviews",
          data: [],
        });

      case "count":
        // Get current count
        const count = await ReviewsQueries.count();
        return NextResponse.json({
          success: true,
          message: `Database contains ${count} reviews`,
          data: { count },
        });

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid action. Use: seed, force, reseed, clear, or count",
            data: [],
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message,
      data: result,
      count: result?.length || 0,
    });

  } catch (error) {
    console.error("Seeding error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        data: [],
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const count = await ReviewsQueries.count();
    const stats = await ReviewsQueries.getStats();

    return NextResponse.json({
      success: true,
      message: "Database status retrieved",
      data: {
        totalReviews: count,
        statistics: stats,
      },
    });

  } catch (error) {
    console.error("Error getting database status:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        data: {},
      },
      { status: 500 }
    );
  }
}
