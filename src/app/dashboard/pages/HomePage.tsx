"use client";

import { DashboardOverview } from "../components/DashboardOverview";
import { PerformanceCharts } from "../components/PerformanceCharts";
import { AdvancedAnalytics } from "../components/AdvancedAnalytics";
import { useReviews } from "@/hooks/use-reviews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Building, Users, Star } from "lucide-react";

export function HomePage() {
  const { reviews, statistics, isLoading, isError, error } = useReviews({
    includeStats: true,
  });

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground">
            Welcome to your Flex Living dashboard
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading Dashboard Data
          </h2>
          <p className="text-red-700">
            {error?.message ||
              "Failed to load dashboard data. Please try refreshing the page."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">
          Welcome to your Flex Living dashboard. Here&apos;s how your properties
          are performing.
        </p>
      </div>

      {/* Key Metrics Overview */}
      <DashboardOverview />

      {/* Performance Charts */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Performance Analytics
        </h2>
        <PerformanceCharts reviews={reviews} isLoading={isLoading} />
      </div>

      {/* Advanced Analytics */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Advanced Insights
        </h2>
        <AdvancedAnalytics reviews={reviews} isLoading={isLoading} />
      </div>

      {/* Summary Footer */}
      {!isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Total Properties</p>
                  <p className="text-2xl font-bold">
                    {new Set(reviews.map((r) => r.listingName)).size}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Total Reviews</p>
                  <p className="text-2xl font-bold">
                    {statistics?.totalReviews || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Average Rating</p>
                  <p className="text-2xl font-bold">
                    {statistics?.overall?.toFixed(1) || "N/A"}/10
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
