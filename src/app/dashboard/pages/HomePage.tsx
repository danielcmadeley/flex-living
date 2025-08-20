"use client";

import { DashboardOverview } from "../components/DashboardOverview";
import { PerformanceCharts } from "../components/PerformanceCharts";
import { AdvancedAnalytics } from "../components/AdvancedAnalytics";
import { useReviews } from "@/hooks/use-reviews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  Building,
  Users,
  Star,
  BarChart3,
  Target,
} from "lucide-react";

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
            Complete analytics and insights for your Flex Living properties
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">
          Complete analytics and insights for your Flex Living properties.
          Monitor performance, track trends, and optimize your hosting strategy.
        </p>
      </div>

      {/* Key Metrics Overview */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Key Performance Metrics
        </h2>
        <DashboardOverview />
      </div>

      {/* Performance Charts */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Performance Analytics
        </h2>
        <PerformanceCharts reviews={reviews} isLoading={isLoading} />
      </div>

      {/* Advanced Analytics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Advanced Insights & Trends
        </h2>
        <AdvancedAnalytics reviews={reviews} isLoading={isLoading} />
      </div>

      {/* Summary Footer */}
      {!isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Quick Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Properties
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(reviews.map((r) => r.listingName)).size}
                  </p>
                  <p className="text-xs text-gray-500">Active listings</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Reviews
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics?.totalReviews || 0}
                  </p>
                  <p className="text-xs text-gray-500">All time feedback</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Average Rating
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics?.overall?.toFixed(1) || "N/A"}/10
                  </p>
                  <p className="text-xs text-gray-500">Overall performance</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
