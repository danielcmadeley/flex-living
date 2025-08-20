"use client";

import { useState, useMemo } from "react";
import { useReviews } from "@/hooks/use-reviews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Building,
  Star,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Calendar,
  Target,
  ChevronRight,
} from "lucide-react";
import { NormalizedReview } from "@/lib/schemas";

export function PropertiesPage() {
  const { reviews, isLoading, isError, error } = useReviews({
    includeStats: true,
  });

  const [selectedProperty, setSelectedProperty] = useState<string>("");

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

  // Get data for selected property
  const selectedPropertyData = useMemo(() => {
    if (!selectedProperty) return null;
    return propertiesData.find((p) => p.name === selectedProperty) || null;
  }, [selectedProperty, propertiesData]);

  // Calculate trends for selected property
  const propertyTrends = useMemo(() => {
    if (!selectedPropertyData) return [];

    const monthlyData = new Map<string, { total: number; count: number }>();

    selectedPropertyData.reviews.forEach((review) => {
      if (review.overallRating) {
        const date = new Date(review.submittedAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, { total: 0, count: 0 });
        }

        const data = monthlyData.get(monthKey)!;
        data.total += review.overallRating;
        data.count += 1;
      }
    });

    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        averageRating: data.total / data.count,
        reviewCount: data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [selectedPropertyData]);

  // Calculate category ratings for selected property
  const categoryRatings = useMemo(() => {
    if (!selectedPropertyData) return [];

    const categories = [
      "cleanliness",
      "communication",
      "location",
      "accuracy",
      "check_in",
      "value",
    ];

    return categories.map((category) => {
      const categoryRatings = selectedPropertyData.reviews
        .map((review) => review.categories[category])
        .filter((rating) => rating !== undefined) as number[];

      const avgRating =
        categoryRatings.length > 0
          ? categoryRatings.reduce((sum, rating) => sum + rating, 0) /
            categoryRatings.length
          : 0;

      return {
        category: category
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        value: Number(avgRating.toFixed(1)),
      };
    });
  }, [selectedPropertyData]);

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
        <h2 className="text-xl font-semibold mb-4">All Properties Overview</h2>
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
                <Card
                  key={property.name}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedProperty === property.name
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                  onClick={() => setSelectedProperty(property.name)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {property.name}
                      </CardTitle>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
              ))}
        </div>
      </div>

      {/* Property Details Section */}
      {selectedProperty && selectedPropertyData && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{selectedProperty}</h2>
              <p className="text-muted-foreground">
                Detailed analytics and insights
              </p>
            </div>
            <Select
              value={selectedProperty}
              onValueChange={setSelectedProperty}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {propertiesData.map((property) => (
                  <SelectItem key={property.name} value={property.name}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Key Metrics for Selected Property */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Rating
                </CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {selectedPropertyData.averageRating.toFixed(1)}/10
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {selectedPropertyData.averageRating >= 8 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {selectedPropertyData.averageRating >= 8
                      ? "Excellent"
                      : "Needs improvement"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Reviews
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {selectedPropertyData.totalReviews}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedPropertyData.recentReviews} in last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Guest Reviews
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {selectedPropertyData.guestToHostReviews}
                </div>
                <p className="text-xs text-muted-foreground">
                  Guest → Host reviews
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Host Reviews
                </CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {selectedPropertyData.hostToGuestReviews}
                </div>
                <p className="text-xs text-muted-foreground">
                  Host → Guest reviews
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts for Selected Property */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Rating Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Rating Trends Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={propertyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip
                      formatter={(value: number) => [
                        `${value.toFixed(1)}/10`,
                        "Average Rating",
                      ]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="averageRating"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Performance Radar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Category Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={categoryRatings}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis domain={[0, 10]} />
                    <Radar
                      name="Rating"
                      dataKey="value"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.3}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Review Volume */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Monthly Review Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={propertyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [value, "Reviews"]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Bar dataKey="reviewCount" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Call to Action when no property selected */}
      {!selectedProperty && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-48">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Property</h3>
            <p className="text-muted-foreground text-center">
              Click on any property above to view detailed analytics and
              insights
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
