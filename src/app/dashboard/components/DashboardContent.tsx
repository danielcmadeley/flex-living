"use client";

import { useState, useMemo } from "react";
import type { User } from "@supabase/supabase-js";
import { useReviews } from "@/hooks/use-reviews";
import { DashboardOverview } from "./DashboardOverview";
import { DashboardFilters, FilterState } from "./DashboardFilters";
import { ReviewsTable } from "./ReviewsTable";
import { PerformanceCharts } from "./PerformanceCharts";
import { AdvancedAnalytics } from "./AdvancedAnalytics";
import { NotificationCenter } from "./NotificationCenter";
import { DatabaseSeeder } from "./DatabaseSeeder";
import LogoutButton from "./LogoutButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardContentProps {
  user: User;
}

export default function DashboardContent({ user }: DashboardContentProps) {
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

  const handleVisibilityToggle = (reviewId: number, isVisible: boolean) => {
    // In a real app, this would make an API call to update the review visibility
    console.log(`Toggle visibility for review ${reviewId} to ${isVisible}`);
    // TODO: Implement API call to update review visibility
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Flex Living Dashboard
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <NotificationCenter reviews={filteredReviews} />
                <span className="text-sm text-gray-700">
                  Welcome, {user.email}
                </span>
                <LogoutButton />
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
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
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Flex Living Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user.email}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-6">
          {/* Overview Cards */}
          <DashboardOverview />

          {/* Filters */}
          <DashboardFilters
            onFiltersChange={setFilters}
            properties={properties}
            isLoading={isLoading}
          />

          {/* Tabbed Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview & Charts</TabsTrigger>
              <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
              <TabsTrigger value="reviews">Review Management</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Performance Charts */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Performance Analytics
                </h2>
                <PerformanceCharts
                  reviews={filteredReviews}
                  isLoading={isLoading}
                />
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {/* Advanced Analytics */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Advanced Analytics & Insights
                </h2>
                <AdvancedAnalytics
                  reviews={filteredReviews}
                  isLoading={isLoading}
                />
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              {/* Reviews Table */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Review Management
                </h2>
                <ReviewsTable
                  reviews={filteredReviews}
                  onVisibilityToggle={handleVisibilityToggle}
                  isLoading={isLoading}
                />
              </div>
            </TabsContent>

            <TabsContent value="database" className="space-y-6">
              {/* Database Management */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Database Management
                </h2>
                <DatabaseSeeder />
              </div>
            </TabsContent>
          </Tabs>

          {/* Summary Footer */}
          {!isLoading && (
            <div className="bg-white rounded-lg border p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Dashboard Summary
                  </h3>
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
          )}
        </div>
      </main>
    </div>
  );
}
