"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { useReviews } from "@/hooks/use-reviews";
import { DashboardSidebar } from "./DashboardSidebar";
import { HomePage } from "../pages/HomePage";
import { PropertiesPage } from "../pages/PropertiesPage";
import { SeedPage } from "../pages/SeedPage";
import { DashboardFilters, FilterState } from "./DashboardFilters";
import { ReviewsTable } from "./ReviewsTable";
import { AdvancedAnalytics } from "./AdvancedAnalytics";
import { SearchAnalytics } from "@/components/SearchAnalytics";
import { useMemo } from "react";

interface DashboardContentProps {
  user: User;
}

export default function DashboardContent({ user }: DashboardContentProps) {
  const pathname = usePathname();
  const [filters, setFilters] = useState<FilterState>({
    sortOrder: "desc",
  });

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
    // The ReviewStatusSelect component handles the API call and cache invalidation
    // This callback is just for any additional handling if needed
    console.log(`Status changed for review ${reviewId} to ${newStatus}`);
  };

  // Render content based on current route
  const renderContent = () => {
    switch (pathname) {
      case "/dashboard":
      case "/dashboard/":
        return <HomePage />;

      case "/dashboard/properties":
        return <PropertiesPage />;

      case "/dashboard/reviews":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Review Management
              </h1>
              <p className="text-muted-foreground">
                Manage and moderate all reviews across your properties
              </p>
            </div>

            <DashboardFilters
              onFiltersChange={setFilters}
              properties={properties}
              isLoading={isLoading}
            />

            <ReviewsTable
              reviews={filteredReviews}
              onStatusChange={handleStatusChange}
              isLoading={isLoading}
            />

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

      case "/dashboard/analytics":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Advanced Analytics
              </h1>
              <p className="text-muted-foreground">
                Deep insights and advanced metrics for your properties
              </p>
            </div>

            <AdvancedAnalytics
              reviews={filteredReviews}
              isLoading={isLoading}
            />
          </div>
        );

      case "/dashboard/search":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Search Analytics
              </h1>
              <p className="text-muted-foreground">
                Search and analyze review patterns and trends
              </p>
            </div>

            <DashboardFilters
              onFiltersChange={setFilters}
              properties={properties}
              isLoading={isLoading}
            />

            <SearchAnalytics reviews={filteredReviews} />
          </div>
        );

      case "/dashboard/seed":
        return <SeedPage />;

      case "/dashboard/settings":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground">
                Configure your dashboard preferences and account settings
              </p>
            </div>
            <div className="bg-white rounded-lg border p-6 text-center">
              <p className="text-muted-foreground">
                Settings page coming soon...
              </p>
            </div>
          </div>
        );

      default:
        return <HomePage />;
    }
  };

  if (isError) {
    return (
      <DashboardSidebar user={user} reviews={filteredReviews}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Error</h1>
            <p className="text-muted-foreground">
              Something went wrong loading the dashboard
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Error Loading Dashboard
            </h2>
            <p className="text-red-700">
              {error?.message ||
                "Failed to load dashboard data. Please try refreshing the page."}
            </p>
          </div>
        </div>
      </DashboardSidebar>
    );
  }

  return (
    <DashboardSidebar user={user} reviews={filteredReviews}>
      {renderContent()}
    </DashboardSidebar>
  );
}
