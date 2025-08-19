'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, TrendingDown, Users, Building } from "lucide-react";
import { useReviewsWithStats } from "@/hooks/use-reviews";

export function DashboardOverview() {
  const { reviews, statistics, isLoading, isError } = useReviewsWithStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-red-500">Failed to load metrics</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalReviews = statistics?.totalReviews || 0;
  const averageRating = statistics?.overall || 0;
  const hostToGuestReviews = statistics?.reviewTypes?.['host-to-guest'] || 0;
  const guestToHostReviews = statistics?.reviewTypes?.['guest-to-host'] || 0;

  // Get unique properties
  const uniqueProperties = new Set(reviews.map(review => review.listingName)).size;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Reviews */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalReviews}</div>
          <p className="text-xs text-muted-foreground">
            All review submissions
          </p>
        </CardContent>
      </Card>

      {/* Average Rating */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-1">
            {averageRating.toFixed(1)}
            <span className="text-sm font-normal text-muted-foreground">/10</span>
          </div>
          <div className="flex items-center gap-1">
            {averageRating >= 8 ? (
              <>
                <TrendingUp className="h-3 w-3 text-green-500" />
                <Badge variant="secondary" className="text-green-600 bg-green-50">
                  Excellent
                </Badge>
              </>
            ) : averageRating >= 6 ? (
              <>
                <Badge variant="secondary" className="text-yellow-600 bg-yellow-50">
                  Good
                </Badge>
              </>
            ) : (
              <>
                <TrendingDown className="h-3 w-3 text-red-500" />
                <Badge variant="secondary" className="text-red-600 bg-red-50">
                  Needs Attention
                </Badge>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Properties */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Properties</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueProperties}</div>
          <p className="text-xs text-muted-foreground">
            Active properties with reviews
          </p>
        </CardContent>
      </Card>

      {/* Review Split */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Review Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Host → Guest:</span>
              <span className="font-medium">{hostToGuestReviews}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Guest → Host:</span>
              <span className="font-medium">{guestToHostReviews}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
