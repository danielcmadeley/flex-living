import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { z } from "zod";

// Helper function for consistent error logging
function logError(context: string, error: unknown, reviewId?: number) {
  console.error(`[API Error - ${context}]`, {
    reviewId,
    error: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });
}

// Schema for validating status updates
const updateStatusSchema = z.object({
  status: z.enum(["published", "pending", "draft"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const reviewId = parseInt(id);

    if (isNaN(reviewId)) {
      logError("Invalid review ID", `Received ID: ${id}`, reviewId);
      return NextResponse.json(
        { success: false, message: "Invalid review ID" },
        { status: 400 },
      );
    }

    const body = await request.json();

    const validation = updateStatusSchema.safeParse(body);

    if (!validation.success) {
      logError("Validation failed", validation.error.issues, reviewId);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status. Must be 'published', 'pending', or 'draft'",
          errors: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const { status } = validation.data;

    // Check if review exists
    const existingReview = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, reviewId))
      .limit(1);

    if (existingReview.length === 0) {
      logError(
        "Review not found",
        `Review ID ${reviewId} does not exist`,
        reviewId,
      );
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 },
      );
    }

    // Update the review status
    const updatedReview = await db
      .update(reviews)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, reviewId))
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: `Review status updated to ${status}`,
        data: updatedReview[0],
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  } catch (error) {
    logError(
      "Database operation failed",
      error,
      parseInt(await params.then((p) => p.id)),
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const reviewId = parseInt(id);

    if (isNaN(reviewId)) {
      logError("Invalid review ID in GET", `Received ID: ${id}`, reviewId);
      return NextResponse.json(
        { success: false, message: "Invalid review ID" },
        { status: 400 },
      );
    }

    const review = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, reviewId))
      .limit(1);

    if (review.length === 0) {
      logError(
        "Review not found in GET",
        `Review ID ${reviewId} does not exist`,
        reviewId,
      );
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: review[0],
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  } catch (error) {
    logError(
      "Database fetch failed in GET",
      error,
      parseInt(await params.then((p) => p.id)),
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
