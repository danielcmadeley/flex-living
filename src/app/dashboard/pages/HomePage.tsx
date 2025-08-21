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
  const { reviews, statistics, isLoading, isFetching, isError, error } =
    useReviews({
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
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">
          Complete analytics and insights for your Flex Living properties.
          Monitor performance, track trends, and optimize your hosting strategy.
        </p>
      </div>

      {/* Key Metrics Overview */}
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Key Performance Metrics
            </h2>
            <p className="text-sm text-gray-600 mt-0.5">
              Real-time overview of your property performance
            </p>
          </div>
        </div>
        <DashboardOverview />
      </div>

      {/* Performance Charts */}
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <BarChart3 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Performance Analytics
            </h2>
            <p className="text-sm text-gray-600 mt-0.5">
              Detailed charts and trends across all properties
            </p>
          </div>
        </div>
        <PerformanceCharts reviews={reviews} isLoading={isLoading} />
      </div>

      {/* Advanced Analytics */}
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Target className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Advanced Insights & Trends
            </h2>
            <p className="text-sm text-gray-600 mt-0.5">
              Deep analytics and predictive insights
            </p>
          </div>
        </div>
        <AdvancedAnalytics reviews={reviews} isLoading={isLoading} />
      </div>

      {/* Summary Footer */}
      {!isLoading && (
        <Card className="bg-gradient-to-br from-white to-gray-50/50 border-gray-200/60 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Quick Summary
                </CardTitle>
                <p className="text-sm text-gray-600 mt-0.5">
                  Key statistics at a glance
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
                  <Building className="h-7 w-7 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Total Properties
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {new Set(reviews.map((r) => r.listingName)).size}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    Active listings
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl shadow-sm">
                  <Users className="h-7 w-7 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Total Reviews
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {statistics?.totalReviews || 0}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    All time feedback
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-xl shadow-sm">
                  <Star className="h-7 w-7 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Average Rating
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {statistics?.overall?.toFixed(1) || "N/A"}/10
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    Overall performance
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
