"use client";

import { useMemo } from "react";

import { useReviews } from "@/hooks/use-reviews";
import { DashboardFilters } from "../components/DashboardFilters";
import { ReviewsTable } from "../components/ReviewsTable";
import { ReviewsGridView } from "../components/ReviewsGridView";
import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";
import { useFilters, useUIState, useUIActions } from "@/stores/dashboard-store";
import { SUCCESS_MESSAGES } from "@/lib/constants";
import { logger } from "@/lib/utils/logger";

export function ReviewsPage() {
  // Zustand store hooks
  const filters = useFilters();
  const uiState = useUIState();
  const { setViewMode, showToast } = useUIActions();

  // Fetch reviews with current filters
  const { reviews, statistics, isLoading } = useReviews({
    ...filters,
    includeStats: true,
  });

  // Get unique properties for filter dropdown
  const properties = useMemo(() => {
    const uniqueProperties = new Set(
      reviews.map((review) => review.listingName),
    );
    return Array.from(uniqueProperties).sort();
  }, [reviews]);

  // Filter reviews based on search term (client-side filtering for instant feedback)
  const filteredReviews = useMemo(() => {
    if (!filters.searchTerm) return reviews;

    const searchLower = filters.searchTerm.toLowerCase();
    return reviews.filter(
      (review) =>
        review.guestName.toLowerCase().includes(searchLower) ||
        review.comment.toLowerCase().includes(searchLower) ||
        review.listingName.toLowerCase().includes(searchLower),
    );
  }, [reviews, filters.searchTerm]);

  const handleStatusChange = (
    reviewId: number,
    newStatus: "published" | "pending" | "draft",
  ) => {
    const dashboardLogger = logger.child("dashboard");
    dashboardLogger.info("Review status changed", { reviewId, newStatus });
    showToast(SUCCESS_MESSAGES.STATUS_UPDATED, "success");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Reviews Dashboard
            </h1>
            <p className="text-muted-foreground">Loading reviews...</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoading && reviews.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Reviews Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage and analyze guest reviews across all properties
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-xl font-medium text-gray-900">
              No reviews found
            </p>
            <p className="mt-2 text-muted-foreground">
              There are no reviews to display at the moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reviews Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage and analyze guest reviews across all properties
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={uiState.viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button
            variant={uiState.viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            <List className="h-4 w-4 mr-2" />
            Table
          </Button>
        </div>
      </div>

      <DashboardFilters properties={properties} />

      {filteredReviews.length === 0 ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900">
              No matching reviews
            </p>
            <p className="mt-2 text-muted-foreground">
              Try adjusting your filters to see more results.
            </p>
          </div>
        </div>
      ) : (
        <>
          {uiState.viewMode === "table" ? (
            <ReviewsTable
              reviews={filteredReviews}
              onStatusChange={handleStatusChange}
              isLoading={isLoading}
            />
          ) : (
            <ReviewsGridView reviews={filteredReviews} isLoading={isLoading} />
          )}

          <div className="bg-white/80 rounded-lg border border-gray-200/50 p-6 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">Review Summary</h3>
                <p className="text-sm text-gray-600">
                  Showing {filteredReviews.length} of {reviews.length} reviews
                  {properties.length > 0 &&
                    ` across ${properties.length} properties`}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
                <div>
                  Average Rating:{" "}
                  <span className="font-medium">
                    {statistics?.overall?.toFixed(1) || "N/A"}/10
                  </span>
                </div>
                <div>
                  Total Reviews:{" "}
                  <span className="font-medium">
                    {statistics?.totalReviews || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
