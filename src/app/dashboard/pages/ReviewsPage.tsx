"use client";

import { useMemo, useEffect } from "react";

import { useReviews } from "@/hooks/use-reviews";
import { DashboardFilters } from "../components/DashboardFilters";
import { ReviewsTable } from "../components/ReviewsTable";
import { ReviewsGridView } from "../components/ReviewsGridView";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationInfo } from "@/components/ui/pagination";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { Grid, List } from "lucide-react";
import {
  useFilters,
  useUIState,
  useUIActions,
  usePagination,
  usePaginationActions,
} from "@/stores/dashboard-store";
import { SUCCESS_MESSAGES } from "@/lib/constants";
import { logger } from "@/lib/utils/logger";

export function ReviewsPage() {
  // Zustand store hooks
  const filters = useFilters();
  const uiState = useUIState();
  const pagination = usePagination();
  const { setViewMode, showToast } = useUIActions();
  const { setCurrentPage, updatePagination } = usePaginationActions();

  // Fetch reviews with current filters and pagination
  const { reviews, statistics, total, isLoading, isFetching } = useReviews({
    ...filters,
    includeStats: true,
  });

  // Update pagination when total changes
  useEffect(() => {
    if (typeof total === "number") {
      updatePagination(total);
    }
  }, [total, updatePagination]);

  // Get unique properties for filter dropdown
  const properties = useMemo(() => {
    const uniqueProperties = new Set(
      reviews.map((review) => review.listingName),
    );
    return Array.from(uniqueProperties).sort();
  }, [reviews]);

  // Use reviews directly since filtering is now handled server-side
  const displayReviews = reviews;

  const handleStatusChange = (
    reviewId: number,
    newStatus: "published" | "pending" | "draft",
  ) => {
    const dashboardLogger = logger.child("dashboard");
    dashboardLogger.info("Review status changed", { reviewId, newStatus });
    showToast(SUCCESS_MESSAGES.STATUS_UPDATED, "success");
  };

  // Show full loading spinner only on initial load (no previous data)
  if (isLoading && !reviews.length) {
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

  if (!isLoading && !isFetching && reviews.length === 0) {
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

      <DashboardFilters properties={properties} isFetching={isFetching} />

      {displayReviews.length === 0 ? (
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
          <LoadingOverlay isLoading={isFetching && reviews.length > 0}>
            {uiState.viewMode === "table" ? (
              <ReviewsTable
                reviews={displayReviews}
                onStatusChange={handleStatusChange}
                isLoading={false}
              />
            ) : (
              <ReviewsGridView reviews={displayReviews} isLoading={false} />
            )}
          </LoadingOverlay>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white/80 rounded-lg border border-gray-200/50 p-4 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <PaginationInfo
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalItems}
                  itemsPerPage={pagination.pageSize}
                />
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          )}

          <div className="bg-white/80 rounded-lg border border-gray-200/50 p-6 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">Review Summary</h3>
                <p className="text-sm text-gray-600">
                  Showing {displayReviews.length} reviews on this page
                  {pagination.totalItems > 0 &&
                    ` of ${pagination.totalItems} total`}
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
                    {pagination.totalItems || 0}
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
