"use client";

import { useMemo } from "react";
import { useReviews } from "@/hooks/use-reviews";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, Calendar, ChevronRight } from "lucide-react";
import { NormalizedReview } from "@/lib/schemas";

export function PropertiesPage() {
  const router = useRouter();
  const { reviews, isLoading, isError, error } = useReviews({
    includeStats: true,
  });

  // Get unique properties and their metrics
  const propertiesData = useMemo(() => {
    const propertyMap = new Map<
      string,
      {
        name: string;
        reviews: NormalizedReview[];
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

      // Check if review is from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      if (new Date(review.submittedAt) > thirtyDaysAgo) {
        property.recentReviews++;
      }
    });

    // Calculate average ratings
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

  const handlePropertyClick = (propertyName: string) => {
    const encodedPropertyName = encodeURIComponent(propertyName);
    router.push(`/dashboard/properties/${encodedPropertyName}`);
  };

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground">
            Individual property analytics and insights
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading Properties Data
          </h2>
          <p className="text-red-700">
            {error?.message ||
              "Failed to load properties data. Please try refreshing the page."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
        <p className="text-muted-foreground">
          Analyze individual property performance and guest satisfaction
        </p>
      </div>

      {/* Properties Overview Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">All Properties Overview</h2>
            <p className="text-sm text-muted-foreground">
              Click on any property to view detailed analytics and reviews
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))
            : propertiesData.map((property) => (
                <div
                  key={property.name}
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] rounded-lg hover:ring-1 hover:ring-gray-300"
                  onClick={() => handlePropertyClick(property.name)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handlePropertyClick(property.name);
                    }
                  }}
                >
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {property.name}
                        </CardTitle>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">
                            Click to view
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">
                              {property.averageRating.toFixed(1)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              /10
                            </span>
                          </div>
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
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3 text-muted-foreground" />
                            <span>{property.totalReviews} reviews</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>{property.recentReviews} recent</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Guest→Host: {property.guestToHostReviews}</span>
                          <span>Host→Guest: {property.hostToGuestReviews}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
