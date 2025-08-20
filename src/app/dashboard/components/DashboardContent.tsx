"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { useReviews } from "@/hooks/use-reviews";
import { DashboardSidebar } from "./DashboardSidebar";
import { HomePage } from "../pages/HomePage";
import { SeedPage } from "../pages/SeedPage";
import { DashboardFilters } from "./DashboardFilters";
import { ReviewsTable } from "./ReviewsTable";
import { ReviewsGridView } from "./ReviewsGridView";
import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";
import {
  useFilters,
  useFilterActions,
  useUIState,
  useUIActions,
} from "@/stores/dashboard-store";
import { ToastContainer } from "@/components/ui/toast";
import { SUCCESS_MESSAGES } from "@/lib/constants";
import { logger } from "@/lib/utils/logger";

interface DashboardContentProps {
  user: User;
}

export default function DashboardContent({ user }: DashboardContentProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Zustand store hooks
  const filters = useFilters();
  const { setFilters } = useFilterActions();
  const uiState = useUIState();
  const { setViewMode, showToast, dismissToast } = useUIActions();

  // Handle URL search parameters for direct navigation from global search
  useEffect(() => {
    const urlSearchTerm = searchParams.get("search");
    const urlMinRating = searchParams.get("minRating");
    const urlStatus = searchParams.get("status");
    const urlRecent = searchParams.get("recent");

    if (urlSearchTerm || urlMinRating || urlStatus || urlRecent) {
      const newFilters: {
        searchTerm?: string;
        minRating?: number;
        status?: "published" | "pending" | "draft";
        dateRange?: { from?: Date; to?: Date };
      } = {
        searchTerm: urlSearchTerm || undefined,
        minRating: urlMinRating ? parseInt(urlMinRating) : undefined,
        status: urlStatus as "published" | "pending" | "draft" | undefined,
      };

      // Handle recent filter (last N days)
      if (urlRecent) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(urlRecent));
        newFilters.dateRange = { from: daysAgo };
      }

      setFilters(newFilters);
    }
  }, [searchParams, setFilters]);

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

  // Render content based on current route
  const renderContent = () => {
    switch (pathname) {
      case "/dashboard":
      case "/dashboard/":
        return <HomePage />;

      case "/dashboard/seed":
        return <SeedPage />;

      default:
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

            {uiState.viewMode === "table" ? (
              <ReviewsTable
                reviews={filteredReviews}
                onStatusChange={handleStatusChange}
                isLoading={isLoading}
              />
            ) : (
              <ReviewsGridView
                reviews={filteredReviews}
                isLoading={isLoading}
              />
            )}

            {!isLoading && (
              <div className="bg-white rounded-lg border p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Review Summary
                    </h3>
                    <p className="text-sm text-gray-600">
                      Showing {filteredReviews.length} of {reviews.length}{" "}
                      reviews
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
            )}
          </div>
        );
    }
  };

  return (
    <DashboardSidebar user={user} reviews={filteredReviews}>
      {renderContent()}

      {/* Toast notifications */}
      {uiState.toast && (
        <ToastContainer
          toasts={[{ ...uiState.toast, onDismiss: dismissToast }]}
          onDismiss={dismissToast}
        />
      )}
    </DashboardSidebar>
  );
}
