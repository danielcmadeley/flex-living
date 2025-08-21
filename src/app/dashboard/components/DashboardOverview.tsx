"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  TrendingUp,
  TrendingDown,
  Users,
  Building,
  MessageSquare,
} from "lucide-react";
import { useReviewsWithStats } from "@/hooks/use-reviews";

export function DashboardOverview() {
  const { reviews, statistics, isLoading, isError } = useReviewsWithStats();

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="bg-white/95 border-gray-200/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Loading...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-100 rounded-md animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-red-50/80 border-red-200/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <p className="text-sm text-red-600 font-medium">
              Failed to load metrics
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalReviews = statistics?.totalReviews || 0;
  const averageRating = statistics?.overall || 0;
  const hostToGuestReviews = statistics?.reviewTypes?.["host-to-guest"] || 0;
  const guestToHostReviews = statistics?.reviewTypes?.["guest-to-host"] || 0;

  // Get unique properties
  const uniqueProperties = new Set(reviews.map((review) => review.listingName))
    .size;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Reviews */}
      <Card className="bg-white/95 border-gray-200/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-200/80">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-700">
            Total Reviews
          </CardTitle>
          <div className="p-2 bg-blue-50 rounded-lg">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {totalReviews}
          </div>
          <p className="text-xs text-gray-500 font-medium">
            All review submissions
          </p>
        </CardContent>
      </Card>

      {/* Average Rating */}
      <Card className="bg-white/95 border-gray-200/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 hover:border-yellow-200/80">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-700">
            Average Rating
          </CardTitle>
          <div className="p-2 bg-yellow-50 rounded-lg">
            <Star className="h-4 w-4 text-yellow-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-1 mb-1 text-gray-900">
            {averageRating.toFixed(1)}
            <span className="text-sm font-medium text-gray-500">/10</span>
          </div>
          <div className="flex items-center gap-1.5">
            {averageRating >= 8 ? (
              <>
                <TrendingUp className="h-3 w-3 text-green-500" />
                <Badge
                  variant="secondary"
                  className="text-green-700 bg-green-50 border-green-200 font-medium"
                >
                  Excellent
                </Badge>
              </>
            ) : averageRating >= 6 ? (
              <>
                <Badge
                  variant="secondary"
                  className="text-yellow-700 bg-yellow-50 border-yellow-200 font-medium"
                >
                  Good
                </Badge>
              </>
            ) : (
              <>
                <TrendingDown className="h-3 w-3 text-red-500" />
                <Badge
                  variant="secondary"
                  className="text-red-700 bg-red-50 border-red-200 font-medium"
                >
                  Needs Attention
                </Badge>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Properties */}
      <Card className="bg-white/95 border-gray-200/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 hover:border-green-200/80">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-700">
            Properties
          </CardTitle>
          <div className="p-2 bg-green-50 rounded-lg">
            <Building className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {uniqueProperties}
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Active properties with reviews
          </p>
        </CardContent>
      </Card>

      {/* Review Split */}
      <Card className="bg-white/95 border-gray-200/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 hover:border-purple-200/80">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-700">
            Review Types
          </CardTitle>
          <div className="p-2 bg-purple-50 rounded-lg">
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Host → Guest:</span>
              <span className="font-semibold text-gray-900">
                {hostToGuestReviews}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Guest → Host:</span>
              <span className="font-semibold text-gray-900">
                {guestToHostReviews}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
