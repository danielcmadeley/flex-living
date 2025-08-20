"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { useReviews } from "@/hooks/use-reviews";
import { DashboardSidebar } from "./DashboardSidebar";
import { HomePage } from "../pages/HomePage";
import { PropertiesPage } from "../pages/PropertiesPage";
import { SeedPage } from "../pages/SeedPage";
import { DashboardFilters } from "./DashboardFilters";
import { ReviewsTable } from "./ReviewsTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NormalizedReview } from "@/lib/schemas";
import {
  Grid,
  List,
  Star,
  MessageSquare,
  Calendar,
  ChevronRight,
} from "lucide-react";
import {
  useFilters,
  useFilterActions,
  useUIState,
  useUIActions,
  useBulkActions,
  useBulkActionMethods,
  useComputedValues,
} from "@/stores/dashboard-store";
import { ToastContainer } from "@/components/ui/toast";

interface DashboardContentProps {
  user: User;
}

// Reviews Grid View Component
function ReviewsGridView({
  reviews,
  isLoading,
}: {
  reviews: NormalizedReview[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-48">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Reviews Found</h3>
          <p className="text-muted-foreground text-center">
            No reviews match your current filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review) => (
        <Card key={review.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">{review.guestName}</CardTitle>
                <p className="text-sm text-muted-foreground truncate">
                  {review.listingName}
                </p>
              </div>
              <div className="flex items-center gap-1 text-yellow-500">
                {review.overallRating && (
                  <>
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-semibold">
                      {review.overallRating.toFixed(1)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <Badge
                variant={
                  review.type === "host-to-guest" ? "default" : "secondary"
                }
              >
                {review.type === "host-to-guest"
                  ? "Host → Guest"
                  : "Guest → Host"}
              </Badge>

              <p className="text-sm line-clamp-3">{review.comment}</p>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(review.submittedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <Badge
                  variant={
                    review.status === "published"
                      ? "default"
                      : review.status === "pending"
                        ? "secondary"
                        : "outline"
                  }
                  className="text-xs"
                >
                  {review.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function DashboardContent({ user }: DashboardContentProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Zustand store hooks
  const filters = useFilters();
  const { setFilters } = useFilterActions();
  const uiState = useUIState();
  const { setViewMode, showToast, dismissToast } = useUIActions();
  const bulkActions = useBulkActions();
  const { hasActiveFilters } = useComputedValues();

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
  const { reviews, statistics, isLoading, isError, error } = useReviews({
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
    // Show success toast
    showToast(`Review status updated to ${newStatus}`, "success");
    console.log(`Status changed for review ${reviewId} to ${newStatus}`);
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
