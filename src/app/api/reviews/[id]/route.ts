import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { z } from "zod";
import { logger } from "@/lib/utils/logger";
import { withRateLimit } from "@/lib/rate-limit";

// Schema for validating status updates
const updateStatusSchema = z.object({
  status: z.enum(["published", "pending", "draft"]),
});

export const PATCH = withRateLimit(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    const apiLogger = logger.child("reviews-api");

    try {
      const { id } = await params;
      const reviewId = parseInt(id);

      if (isNaN(reviewId)) {
        apiLogger.warn("Invalid review ID received", { id, reviewId });
        return NextResponse.json(
          { success: false, message: "Invalid review ID" },
          { status: 400 },
        );
      }

      const body = await request.json();
      const validation = updateStatusSchema.safeParse(body);

      if (!validation.success) {
        apiLogger.warn("Validation failed for status update", {
          reviewId,
          errors: validation.error.issues,
        });
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid status. Must be 'published', 'pending', or 'draft'",
            errors: validation.error.issues,
          },
          { status: 400 },
        );
      }

      const { status } = validation.data;

      // Update the review status in the database
      const [updatedReview] = await db
        .update(reviews)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(reviews.id, reviewId))
        .returning();

      if (!updatedReview) {
        apiLogger.warn("Review not found for update", { reviewId });
        return NextResponse.json(
          { success: false, message: "Review not found" },
          { status: 404 },
        );
      }

      apiLogger.info("Review status updated successfully", {
        reviewId,
        newStatus: status,
      });

      return NextResponse.json({
        success: true,
        data: updatedReview,
      });
    } catch (error) {
      apiLogger.error("Failed to update review status", error, {
        action: "PATCH",
      });

      return NextResponse.json(
        {
          success: false,
          message: "Failed to update review status",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  },
  { type: "mutation" },
);

export const DELETE = withRateLimit(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    const apiLogger = logger.child("reviews-api");

    try {
      const { id } = await params;
      const reviewId = parseInt(id);

      if (isNaN(reviewId)) {
        apiLogger.warn("Invalid review ID for deletion", { id, reviewId });
        return NextResponse.json(
          { success: false, message: "Invalid review ID" },
          { status: 400 },
        );
      }

      // Delete the review from the database
      const [deletedReview] = await db
        .delete(reviews)
        .where(eq(reviews.id, reviewId))
        .returning();

      if (!deletedReview) {
        apiLogger.warn("Review not found for deletion", { reviewId });
        return NextResponse.json(
          { success: false, message: "Review not found" },
          { status: 404 },
        );
      }

      apiLogger.info("Review deleted successfully", { reviewId });

      return NextResponse.json({
        success: true,
        message: "Review deleted successfully",
      });
    } catch (error) {
      apiLogger.error("Failed to delete review", error, {
        action: "DELETE",
      });

      return NextResponse.json(
        {
          success: false,
          message: "Failed to delete review",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  },
  { type: "mutation" },
);
