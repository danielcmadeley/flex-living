"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import {
  Grid,
  List,
  Star,
  MessageSquare,
  Calendar,
  ChevronRight,
  Building,
} from "lucide-react";

interface DashboardContentProps {
  user: User;
}

export default function DashboardContent({ user }: DashboardContentProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterState>({
    sortOrder: "desc",
  });
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Handle URL search parameters for direct navigation from global search
  useEffect(() => {
    const urlSearchTerm = searchParams.get("search");
    const urlMinRating = searchParams.get("minRating");
    const urlStatus = searchParams.get("status");
    const urlRecent = searchParams.get("recent");

    if (urlSearchTerm || urlMinRating || urlStatus || urlRecent) {
      const newFilters: FilterState = {
        sortOrder: "desc",
        searchTerm: urlSearchTerm || undefined,
        minRating: urlMinRating ? parseInt(urlMinRating) : undefined,
        status: urlStatus as "published" | "pending" | "draft" | undefined,
      };

      // Handle recent filter (last N days)
      if (urlRecent) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(urlRecent));
        // Note: This would require additional date filtering logic in useReviews
      }

      setFilters(newFilters);
    }
  }, [searchParams]);

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
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Properties
                </h1>
                <p className="text-muted-foreground">
                  Analyze individual property performance and guest satisfaction
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4 mr-1" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                >
                  <List className="h-4 w-4 mr-1" />
                  Table
                </Button>
              </div>
            </div>

            {viewMode === "grid" ? (
              <PropertiesPage />
            ) : (
              <PropertiesTableView
                reviews={filteredReviews}
                isLoading={isLoading}
              />
            )}
          </div>
        );

      case "/dashboard/reviews":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Review Management
                </h1>
                <p className="text-muted-foreground">
                  Manage and moderate all reviews across your properties
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4 mr-1" />
                  Cards
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                >
                  <List className="h-4 w-4 mr-1" />
                  Table
                </Button>
              </div>
            </div>

            <DashboardFilters
              onFiltersChange={setFilters}
              properties={properties}
              isLoading={isLoading}
            />

            {viewMode === "table" ? (
              <ReviewsTable
                reviews={filteredReviews}
                onStatusChange={handleStatusChange}
                isLoading={isLoading}
              />
            ) : (
              <ReviewsGridView
                reviews={filteredReviews}
                onStatusChange={handleStatusChange}
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

      case "/dashboard/search":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Search Analytics
              </h1>
              <p className="text-muted-foreground">
                Search and analyze review patterns and trends
                {filters.searchTerm && (
                  <span className="block mt-1 text-sm">
                    Showing results for:{" "}
                    <strong>&ldquo;{filters.searchTerm}&rdquo;</strong>
                  </span>
                )}
              </p>
            </div>

            <DashboardFilters
              onFiltersChange={setFilters}
              properties={properties}
              isLoading={isLoading}
            />

            <SearchAnalytics reviews={filteredReviews} />

            {/* Enhanced search results when coming from global search */}
            {(filters.searchTerm || filters.minRating || filters.status) && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Search Results</h2>
                <ReviewsTable
                  reviews={filteredReviews}
                  onStatusChange={handleStatusChange}
                  isLoading={isLoading}
                />
              </div>
            )}
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

  // Properties Table View Component
  function PropertiesTableView({
    reviews,
    isLoading,
  }: {
    reviews: any[];
    isLoading: boolean;
  }) {
    const propertiesData = useMemo(() => {
      const propertyMap = new Map<
        string,
        {
          name: string;
          reviews: any[];
          averageRating: number;
          totalReviews: number;
          recentReviews: number;
          guestToHostReviews: number;
          hostToGuestReviews: number;
        }
      >();

      reviews.forEach((review) => {
        if (!propertyMap.has(review.listingName)) {
          propertyMap.set(review.listingName, {
            name: review.listingName,
            reviews: [],
            averageRating: 0,
            totalReviews: 0,
            recentReviews: 0,
            guestToHostReviews: 0,
            hostToGuestReviews: 0,
          });
        }

        const property = propertyMap.get(review.listingName)!;
        property.reviews.push(review);
        property.totalReviews++;

        if (review.type === "guest-to-host") {
          property.guestToHostReviews++;
        } else {
          property.hostToGuestReviews++;
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        if (new Date(review.submittedAt) > thirtyDaysAgo) {
          property.recentReviews++;
        }
      });

      propertyMap.forEach((property) => {
        const ratingsWithValues = property.reviews.filter(
          (r) => r.overallRating !== null,
        );
        if (ratingsWithValues.length > 0) {
          property.averageRating =
            ratingsWithValues.reduce((sum, r) => sum + r.overallRating!, 0) /
            ratingsWithValues.length;
        }
      });

      return Array.from(propertyMap.values()).sort(
        (a, b) => b.totalReviews - a.totalReviews,
      );
    }, [reviews]);

    if (isLoading) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Properties ({propertiesData.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Property Name</th>
                  <th className="text-left p-3 font-semibold">
                    Average Rating
                  </th>
                  <th className="text-left p-3 font-semibold">Total Reviews</th>
                  <th className="text-left p-3 font-semibold">Recent (30d)</th>
                  <th className="text-left p-3 font-semibold">Guest Reviews</th>
                  <th className="text-left p-3 font-semibold">Host Reviews</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {propertiesData.map((property) => (
                  <tr key={property.name} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{property.name}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">
                          {property.averageRating.toFixed(1)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /10
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-medium">
                        {property.totalReviews}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-medium">
                        {property.recentReviews}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-medium">
                        {property.guestToHostReviews}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-medium">
                        {property.hostToGuestReviews}
                      </span>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={
                          property.averageRating >= 8
                            ? "default"
                            : property.averageRating >= 6
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {property.averageRating >= 8
                          ? "Excellent"
                          : property.averageRating >= 6
                            ? "Good"
                            : "Needs Attention"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          (window.location.href = `/dashboard/properties/${encodeURIComponent(property.name)}`)
                        }
                      >
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Reviews Grid View Component
  function ReviewsGridView({
    reviews,
    onStatusChange,
    isLoading,
  }: {
    reviews: any[];
    onStatusChange: (
      reviewId: number,
      newStatus: "published" | "pending" | "draft",
    ) => void;
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
                  <CardTitle className="text-base">
                    {review.guestName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {review.listingName}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {review.overallRating && (
                    <>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
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

  return (
    <DashboardSidebar user={user} reviews={filteredReviews}>
      {renderContent()}
    </DashboardSidebar>
  );
}
